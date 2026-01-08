import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Request } from 'express'; // 引入 Express Request 类型

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    
    // 获取 Pino 生成的 id (它会自动挂载到 request.id)
    // 如果没有 pino，就自己取 header
    const traceId = request.id || request.headers['x-request-id'] || '';

    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'OK',
        data: data,
        trace_id: traceId, // 注入到返回包里
      })),
    );
  }
}