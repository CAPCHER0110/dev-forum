// apps/api/src/auth/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  // 核心逻辑：返回 true 放行，返回 false 或抛异常拦截
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('未登录：请提供 Token');
    }

    try {
      // 验证 Token (验证签名 + 有效期)
      // const payload = await this.jwtService.verifyAsync(token);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      // 💡 关键点：把用户信息挂载到 request 对象上
      // 在 Go 里这通常是 ctx.Set("user", payload)
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('登录过期或 Token 无效');
    }
    return true;
  }

  // 辅助函数：从 Header 提取 "Bearer <token>"
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}