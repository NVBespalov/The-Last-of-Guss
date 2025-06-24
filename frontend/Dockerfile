# Используем Node.js как базовый образ
FROM node:20-alpine as build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Используем легковесный nginx для раздачи статики
FROM nginx:alpine

# Копируем собранное приложение из build-этапа
COPY --from=build /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx (опционально, если есть своя конфигурация)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]