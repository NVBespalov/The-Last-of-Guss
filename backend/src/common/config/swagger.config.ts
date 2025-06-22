import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const createSwaggerConfig = (env: string) => {
  return new DocumentBuilder()
    .setTitle('The Last of Guss API')
    .setDescription(`API для игры The Last of Guss (${env.toUpperCase()})`)
    .setVersion('1.0')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('users', 'Управление пользователями')
    .addTag('sessions', 'Игровые сессии')
    .addTag('rounds', 'Игровые раунды')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите ваш JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
};

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
  customSiteTitle: 'The Last of Guss API Docs',
  customCss: `
    .topbar-wrapper img { content:url('https://nestjs.com/img/logo-small.svg'); width:50px; height:auto; }
    .swagger-ui .topbar { background-color: #0D47A1; }
  `,
};
