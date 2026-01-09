import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow('STRIPE_SECRET_KEY'), {
      // apiVersion: '2025-12-15.clover', // 使用最新版或你锁定的版本
    });
  }

  // 1. 创建支付会话
  async createCheckoutSession(userId: number, userEmail: string) {
    // 查找用户是否已经有 Stripe Customer ID
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // 非空检查
    // 如果找不到用户，直接抛出异常，阻止后面报错
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    let customerId = user.stripeCustomerId;

    // 如果没有，先在 Stripe 创建客户
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: userEmail,
        metadata: { userId: userId.toString() },
      });
      customerId = customer.id;
      // 回写到数据库
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // 创建 Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription', // 订阅模式
      line_items: [
        {
          price: this.configService.get('STRIPE_PRICE_ID_PRO'),
          quantity: 1,
        },
      ],
      // 支付成功/取消后的跳转地址
      success_url: `${this.configService.get('FRONTEND_URL')}/pricing?success=true`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/pricing?canceled=true`,
      // 在元数据里存 userId，方便 Webhook 找不到 Customer 时兜底
      metadata: {
        userId: userId.toString(),
      },
    });

    const successUrl = `${this.configService.get('FRONTEND_URL')}/pricing?success=true`;
    this.logger.log(`Redirect URL: ${successUrl}`);

    return { url: session.url };
  }

  // 处理 Webhook (核心逻辑)
  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // 处理我们关心的事件
    switch (event.type) {
      case 'checkout.session.completed': // 首次支付成功
      case 'invoice.payment_succeeded':  // 续费成功
        await this.handleSubscriptionUpdate(event.data.object as any);
        break;
      case 'customer.subscription.deleted': // 订阅取消/过期
        await this.handleSubscriptionDeleted(event.data.object as any);
        break;
      default:
        // console.log(`Unhandled event type ${event.type}`);
    }
  }

  private async handleSubscriptionUpdate(session: Stripe.Checkout.Session | Stripe.Invoice) {
    // 这里逻辑稍微复杂，因为 checkout.session 和 invoice 的结构略有不同
    // 我们主要需要 subscriptionId 和 customerId
    const customerId = (session as any).customer as string;
    const subscriptionId = (session as any).subscription as string;

    // 获取最新的订阅详情（主要是为了拿到 current_period_end）
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    // 从 items.data[0] 获取周期信息和价格 ID
    // Stripe v20+ 移除了顶层的 current_period_end
    const subscriptionItem = subscription.items.data[0]; 

    if (!subscriptionItem) {
      this.logger.error(`Subscription ${subscriptionId} has no items.`);
      return;
    }

    await this.prisma.user.update({
      where: { stripeCustomerId: customerId },
      data: {
        isPro: true,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscriptionItem.price.id,
        stripeCurrentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
      },
    });
    this.logger.log(`✅ User (Customer: ${customerId}) upgraded to Pro`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await this.prisma.user.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        isPro: false,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
    });
    this.logger.log(`❌ User (Sub: ${subscription.id}) subscription cancelled`);
  }
}