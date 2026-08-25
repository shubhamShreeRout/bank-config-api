import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from './error-codes';
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : {};
    const detail =
      typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    res.status(status).json({
      success: false,
      error: {
        code:
          detail.code ||
          (status === 404
            ? ErrorCode.CONFIGURATION_NOT_FOUND
            : status === 401
              ? ErrorCode.UNAUTHORIZED
              : status === 403
                ? ErrorCode.FORBIDDEN
                : status === 400
                  ? ErrorCode.VALIDATION_ERROR
                  : ErrorCode.INTERNAL_SERVER_ERROR),
        message: detail.message || (typeof body === 'string' ? body : 'Internal server error'),
      },
    });
  }
}
