FROM node:18-alpine AS builder

WORKDIR /app

RUN mkdir -p /app/logs && \
    chmod 777 /app/logs

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Удаляем dev зависимости и устанавливаем только prod
RUN npm prune --production

# Второй этап сборки - финальный образ
FROM node:18-alpine

WORKDIR /app

# Устанавливаем timezone
ENV TZ=Europe/Moscow

# Копируем собранное приложение и node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Создаем пользователя для запуска приложения
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nestjs

# Открываем порты
EXPOSE 3000

# Запускаем приложение
CMD ["node", "--experimental-global-webcrypto", "dist/main"]