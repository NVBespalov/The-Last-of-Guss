import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const errorMessage =
      typeof errorResponse === 'object' && 'message' in errorResponse
        ? errorResponse['message']
        : exception.message;

    const errorObj = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
    };

    // Логирование ошибки
    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorObj),
      exception.stack,
    );

    response.status(status).json(errorObj);
  }
}
