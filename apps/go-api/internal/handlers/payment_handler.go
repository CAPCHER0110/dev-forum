package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"go-api/internal/models"
	"go-api/internal/pkg/apperr"
	"go-api/internal/pkg/response"
	"go-api/internal/svc"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/checkout/session"
	"github.com/stripe/stripe-go/v79/customer"
	"github.com/stripe/stripe-go/v79/subscription"
	"github.com/stripe/stripe-go/v79/webhook"
)

type PaymentHandler struct {
	svc *svc.ServiceContext
}

func NewPaymentHandler(svc *svc.ServiceContext) *PaymentHandler {
	// 设置全局 Key (也可以在每次调用 API 时通过 Params 传递)
	stripe.Key = svc.Config.Stripe.SecretKey
	return &PaymentHandler{svc: svc}
}

// 创建 Checkout Session
func (h *PaymentHandler) CreateCheckoutSession(c *gin.Context) {
	// 获取当前用户 (从中间件设置的 Context 中)
	userID, exists := c.Get("userID")
	if !exists {

		response.Fail(c, http.StatusUnauthorized, apperr.CodeUnauthorized, apperr.GetMsg(apperr.CodeUnauthorized))
		return
	}

	// 查询数据库获取用户信息
	var user models.User
	if err := h.svc.DB.First(&user, userID).Error; err != nil {
		response.Fail(c, http.StatusNotFound, apperr.CodeUserNotFound, apperr.GetMsg(apperr.CodeUserNotFound))
		return
	}

	customerID := user.StripeCustomerID

	// 如果没有 Stripe Customer，创建一个
	if customerID == nil || *customerID == "" {
		params := &stripe.CustomerParams{
			Email: stripe.String(user.Email),
			Params: stripe.Params{
				Metadata: map[string]string{"userId": string(rune(user.ID))},
			},
		}
		cust, err := customer.New(params)
		if err != nil {
			response.Fail(c, http.StatusInternalServerError, apperr.CodeStripeError, apperr.GetMsg(apperr.CodeStripeError))
			return
		}

		// 保存 CustomerID 到数据库
		custIDStr := cust.ID
		user.StripeCustomerID = &custIDStr
		h.svc.DB.Save(&user)
		customerID = &custIDStr
	}

	// 创建 Session
	params := &stripe.CheckoutSessionParams{
		Customer:           stripe.String(*customerID),
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		Mode:               stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(h.svc.Config.Stripe.PriceIDPro),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(h.svc.Config.Stripe.FrontendURL + "/pricing?success=true"),
		CancelURL:  stripe.String(h.svc.Config.Stripe.FrontendURL + "/pricing?canceled=true"),
	}

	s, err := session.New(params)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, apperr.CodeStripeError, apperr.GetMsg(apperr.CodeStripeError))
		return
	}

	response.Success(c, gin.H{"url": s.URL})
}

// 处理 Webhook
func (h *PaymentHandler) HandleWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)

	// 读取原始 Body (用于签名验证)
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.Status(http.StatusServiceUnavailable)
		return
	}

	// 验证签名
	event, err := webhook.ConstructEvent(payload, c.GetHeader("Stripe-Signature"), h.svc.Config.Stripe.WebhookSecret)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Webhook signature verification failed"})
		return
	}

	// 处理事件
	switch event.Type {
	case "checkout.session.completed", "invoice.payment_succeeded":
		var session stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &session)
		if err == nil {
			h.handleSubscriptionUpdate(session.Customer.ID, session.Subscription.ID)
		}

	case "customer.subscription.deleted":
		var sub stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &sub)
		if err == nil {
			h.handleSubscriptionDeleted(sub.ID)
		}
	}

	c.Status(http.StatusOK)
}

// 内部逻辑：更新订阅状态
func (h *PaymentHandler) handleSubscriptionUpdate(customerID, subscriptionID string) {
	// 获取最新的订阅详情
	sub, err := subscription.Get(subscriptionID, nil)
	if err != nil {
		return
	}

	var user models.User
	if err := h.svc.DB.Where("stripe_customer_id = ?", customerID).First(&user).Error; err != nil {
		return
	}

	endTime := time.Unix(sub.CurrentPeriodEnd, 0)
	priceID := sub.Items.Data[0].Price.ID

	// 更新数据库
	h.svc.DB.Model(&user).Updates(models.User{
		IsPro:                  true,
		StripeSubscriptionID:   &sub.ID,
		StripePriceID:          &priceID,
		StripeCurrentPeriodEnd: &endTime,
	})
}

// 内部逻辑：取消订阅
func (h *PaymentHandler) handleSubscriptionDeleted(subscriptionID string) {
	h.svc.DB.Model(&models.User{}).
		Where("stripe_subscription_id = ?", subscriptionID).
		Updates(map[string]interface{}{
			"is_pro":                    false,
			"stripe_subscription_id":    nil,
			"stripe_price_id":           nil,
			"stripe_current_period_end": nil,
		})
}
