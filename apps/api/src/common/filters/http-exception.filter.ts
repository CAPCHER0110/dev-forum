// apps/api/src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // 捕获所有异常，不只是 HttpException
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // 获取状态码
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 获取错误信息
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // 获取 Trace ID
    const traceId = request.id || request.headers['x-request-id'];

    response.status(status).json({
      code: status,
      message: message,
      data: null,
      trace_id: traceId, // 报错时一定要带上这个
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}