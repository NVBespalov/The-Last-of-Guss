import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ошибка базы данных';

    // PostgreSQL дублирование ключа ошибка
    if (
      exception.message.includes('duplicate key') ||
      exception.message.includes('UNIQUE constraint failed')
    ) {
      status = HttpStatus.CONFLICT;
      message = 'Запись с таким значением уже существует';
    }

    const errorObj = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    this.logger.error(
      `База данных: ${exception.message}`,
      JSON.stringify(errorObj),
      exception.stack,
    );

    response.status(status).json({
      success: false,
      error: {
        code: status.toString(),
        message: message,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
