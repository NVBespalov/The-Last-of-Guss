import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { join } from 'path';

const logDir = join(process.cwd(), 'logs');
console.log('logdir', logDir);

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    // Консольный вывод для разработки
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // Файловый транспорт для доступа Filebeat
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Отдельный файл для ошибок
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
