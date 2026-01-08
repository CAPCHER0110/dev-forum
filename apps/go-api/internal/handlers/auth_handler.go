package handlers

import (
	"net/http"
	"time"

	"go-api/internal/logger"
	"go-api/internal/models"
	"go-api/internal/pkg/apperr"
	"go-api/internal/pkg/response"
	"go-api/internal/svc"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	svc *svc.ServiceContext
}

func NewAuthHandler(ctx *svc.ServiceContext) *AuthHandler {
	return &AuthHandler{
		svc: ctx,
	}
}

// 注册
func (h *AuthHandler) Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		// c.JSON(http.StatusBadRequest, gin.H{"error": "输入格式有误"})
		response.Fail(c, http.StatusBadRequest, apperr.CodeInvalidParam, apperr.GetMsg(apperr.CodeInvalidParam))
		return
	}

	// 1. 密码哈希加密
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	user := models.User{
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	// 2. 存入数据库
	if err := h.svc.DB.Create(&user).Error; err != nil {
		// c.JSON(http.StatusConflict, gin.H{"error": "该邮箱已被注册"})
		response.Fail(c, http.StatusConflict, apperr.CodeUserExist, apperr.GetMsg(apperr.CodeUserExist))
		return
	}

	// c.JSON(http.StatusCreated, gin.H{"message": "注册成功"})
	response.Success(c, nil)
}

// 登录
func (h *AuthHandler) Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		// c.JSON(http.StatusBadRequest, gin.H{"error": "缺少账号或密码"})
		response.Fail(c, http.StatusBadRequest, apperr.CodeInvalidParam, "邮箱和密码不能为空")
		return
	}

	// 1. 查找用户
	var user models.User
	if err := h.svc.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// c.JSON(http.StatusUnauthorized, gin.H{"error": "用户不存在"})
		response.Fail(c, http.StatusNotFound, apperr.CodeUserNotFound, apperr.GetMsg(apperr.CodeUserNotFound))
		return
	}

	// 2. 校验密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		// c.JSON(http.StatusUnauthorized, gin.H{"error": "密码错误"})
		response.Fail(c, http.StatusUnauthorized, apperr.CodeUnauthorized, apperr.GetMsg(apperr.CodeUnauthorized))
		return
	}

	// 3. 签发 JWT (与 NestJS 载荷结构保持一致)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(), // 24小时过期
	})

	tokenString, err := token.SignedString([]byte(h.svc.Config.JWTSecret))
	if err != nil {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": "生成Token失败"})
		response.Fail(c, http.StatusInternalServerError, apperr.CodeInternalError, apperr.GetMsg(apperr.CodeInternalError))
		return
	}

	// c.JSON(http.StatusOK, gin.H{
	// 	"access_token": tokenString,
	// })
	response.Success(c, gin.H{
		"access_token": tokenString,
	})

	logger.Info(c, "user_login_success", "user_id", user.ID, "email", user.Email)
}
