import { Controller, Post, Body, Req, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 1. 创建支付链接 (需要登录)
  @UseGuards(AuthGuard)
  @Post('checkout')
  async createCheckout(@Req() req) {
    // 假设 AuthGuard 把 user 挂载到了 req.user
    const userId = req.user.sub || req.user.id; 
    const userEmail = req.user.email || 'test@example.com'; 
    return this.paymentService.createCheckoutSession(userId, userEmail);
  }

  // 2. Webhook 回调 (Stripe 调用的，不需要 AuthGuard)
  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>, // 获取 Raw Body
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    
    // NestJS 如果配置正确，req.rawBody 会包含 Buffer
    const rawBody = req.rawBody;
    if (!rawBody) {
       throw new BadRequestException('Raw body not available');
    }

    try {
      await this.paymentService.handleWebhook(signature, rawBody);
      return { received: true };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}