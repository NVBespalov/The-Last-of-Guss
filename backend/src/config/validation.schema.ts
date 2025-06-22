import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Общие настройки приложения
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),

  // База данных
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_DATABASE: Joi.string().required(),
  DB_SCHEMA: Joi.string().default('public'),
  DB_SYNCHRONIZE: Joi.boolean().default(true),
  DB_LOGGING: Joi.boolean().default(true),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.number().default(3600),

  // WebSocket
  WS_PORT: Joi.number().default(3001),
  WS_CORS_ORIGIN: Joi.string().default('*'),
});
