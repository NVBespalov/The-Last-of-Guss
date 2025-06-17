Руководство по развертыванию

## Содержание
- [Введение](#введение)
- [Требования](#требования)
- [Структура проекта](#структура-проекта)
- [Среды развертывания](#среды-развертывания)
- [Подготовка к развертыванию](#подготовка-к-развертыванию)
- [Развертывание на локальном сервере](#развертывание-на-локальном-сервере)
- [Развертывание на сервере разработки](#развертывание-на-сервере-разработки)
- [Развертывание в продакшн](#развертывание-в-продакшн)
- [Настройка базы данных PostgreSQL](#настройка-базы-данных-postgresql)
- [Настройка WebSocket сервера](#настройка-websocket-сервера)
- [Мониторинг и логирование](#мониторинг-и-логирование)
- [Автоматизация развертывания](#автоматизация-развертывания)
- [Откат изменений](#откат-изменений)
- [Решение проблем](#решение-проблем)

## Введение

Данное руководство описывает процесс развертывания проекта "The Last of Guss" в различных средах. Проект представляет собой монорепозиторий с отдельными фронтенд и бэкенд компонентами, использующий PostgreSQL в качестве базы данных и WebSockets для обмена данными в реальном времени.

## Требования

Для успешного развертывания проекта требуются:

- Node.js (версия 16.x или выше)
- npm (версия 8.x или выше)
- PostgreSQL (версия 14.x или выше)
- Nginx (для продакшн-среды)
- PM2 или аналогичный менеджер процессов (для продакшн-среды)
- Git
- Docker (опционально)

## Структура проекта
```
The-Last-of-Guss/ ├── frontend/ # Фронтенд часть проекта ├── backend/ # Бэкенд часть проекта └── docker/ # Конфигурация Docker (если используется)
``` 

## Среды развертывания

Проект может быть развернут в следующих средах:

1. **Локальная среда разработки** - для разработки и тестирования на локальном компьютере
2. **Тестовая среда (DEV)** - для интеграционного тестирования и демонстрации
3. **Продакшн среда (PROD)** - для конечных пользователей

## Подготовка к развертыванию

### 1. Клонирование репозитория
```
bash git clone [https://github.com/NVBespalov/The-Last-of-Guss.git](https://github.com/NVBespalov/The-Last-of-Guss.git) cd The-Last-of-Guss
``` 

### 2. Установка зависимостей
```
bash
# Установка зависимостей для фронтенда
cd frontend npm install
# Установка зависимостей для бэкенда
cd ../backend npm install
``` 

### 3. Настройка переменных окружения

Для каждой среды необходимо создать соответствующие файлы переменных окружения:

**Для бэкенда (backend/.env.production)**:
```
NODE_ENV=production PORT=3000 WS_PORT=8080
# PostgreSQL
POSTGRES_HOST=localhost POSTGRES_PORT=5432 POSTGRES_USER=prod_user POSTGRES_PASSWORD=secure_password POSTGRES_DB=the_last_of_guss_prod
# Другие настройки
JWT_SECRET=your_jwt_secret
``` 

**Для фронтенда (frontend/.env.production)**:
```
REACT_APP_API_URL=[https://api.your-domain.com](https://api.your-domain.com) REACT_APP_WS_URL=wss://api.your-domain.com/ws
``` 

## Развертывание на локальном сервере

### 1. Сборка проекта
```
bash
# Сборка фронтенда
cd frontend npm run build
# Сборка бэкенда
cd ../backend npm run build
``` 

### 2. Запуск проекта
```
bash
# Запуск бэкенда
cd backend npm run start
# Запуск фронтенда (если требуется отдельно)
cd frontend npm run serve
``` 

## Развертывание на сервере разработки

### 1. Подготовка сервера
```
bash
# Установка необходимых пакетов на сервере
sudo apt update sudo apt install -y nodejs npm postgresql nginx
# Установка PM2
npm install -g pm2
``` 

### 2. Клонирование и настройка проекта
```
bash
# Клонирование репозитория
git clone [https://github.com/NVBespalov/The-Last-of-Guss.git](https://github.com/NVBespalov/The-Last-of-Guss.git) cd The-Last-of-Guss
# Создание и настройка .env файлов
cp backend/.env.example backend/.env cp frontend/.env.example frontend/.env
# Отредактируйте файлы в соответствии с настройками среды разработки
``` 

### 3. Сборка и запуск
```
bash
# Установка зависимостей и сборка фронтенда
cd frontend npm install npm run build
# Установка зависимостей и сборка бэкенда
cd ../backend npm install npm run build
# Запуск бэкенда с PM2
pm2 start npm --name "the-last-of-guss-backend" -- run start
``` 

### 4. Настройка Nginx

Создайте файл конфигурации Nginx:
```
nginx server { listen 80; server_name dev.your-domain.com;
location / {
root /path/to/The-Last-of-Guss/frontend/build;
try_files $uri /index.html;
}

location /api {
proxy_pass http://localhost:3000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
}

location /ws {
proxy_pass http://localhost:8080;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
proxy_set_header Host $host;
}
}
``` 

Активируйте конфигурацию и перезапустите Nginx:
```
bash sudo ln -s /etc/nginx/sites-available/the-last-of-guss /etc/nginx/sites-enabled/ sudo nginx -t sudo systemctl restart nginx
``` 

## Развертывание в продакшн

### 1. Подготовка продакшн-сервера
```
bash
# Установка необходимых пакетов
sudo apt update sudo apt install -y nodejs npm postgresql nginx certbot python3-certbot-nginx
# Установка PM2
npm install -g pm2
``` 

### 2. Настройка безопасного соединения (HTTPS)
```
bash
# Получение SSL-сертификата
sudo certbot --nginx -d your-domain.com -d [www.your-domain.com](http://www.your-domain.com)
``` 

### 3. Настройка проекта
```
bash
# Клонирование репозитория
git clone [https://github.com/NVBespalov/The-Last-of-Guss.git](https://github.com/NVBespalov/The-Last-of-Guss.git) cd The-Last-of-Guss
# Создание и настройка .env файлов для продакшн
cp backend/.env.example backend/.env.production cp frontend/.env.example frontend/.env.production
# Отредактируйте файлы в соответствии с продакшн-настройками
``` 

### 4. Сборка и запуск
```
bash
# Установка зависимостей и сборка фронтенда
cd frontend npm ci --production npm run build
# Установка зависимостей и сборка бэкенда
cd ../backend npm ci --production npm run build
# Запуск бэкенда с PM2
pm2 start npm --name "the-last-of-guss-backend" -- run start:prod pm2 save pm2 startup
``` 

### 5. Настройка Nginx для продакшн
```
nginx server { listen 443 ssl; server_name your-domain.com [www.your-domain.com](http://www.your-domain.com);
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

# Настройки SSL
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# Настройки безопасности
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options SAMEORIGIN;
add_header X-XSS-Protection "1; mode=block";

location / {
root /path/to/The-Last-of-Guss/frontend/build;
try_files $uri /index.html;

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

location /api {
proxy_pass http://localhost:3000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_cache_bypass $http_upgrade;
}

location /ws {
proxy_pass http://localhost:8080;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
}
# Перенаправление с HTTP на HTTPS
server { listen 80; server_name your-domain.com [www.your-domain.com](http://www.your-domain.com); return 301 https://hostrequest_uri; }
``` 

## Настройка базы данных PostgreSQL

### 1. Настройка базы данных для продакшн
```
bash
# Подключение к PostgreSQL
sudo -u postgres psql
# Создание пользователя и базы данных
CREATE USER prod_user WITH PASSWORD 'secure_password'; CREATE DATABASE the_last_of_guss_prod; GRANT ALL PRIVILEGES ON DATABASE the_last_of_guss_prod TO prod_user;
# Выход из PostgreSQL
\q
``` 

### 2. Настройка безопасности PostgreSQL

Отредактируйте файл `pg_hba.conf` для ограничения доступа:
```
bash sudo nano /etc/postgresql/14/main/pg_hba.conf
``` 

Добавьте или измените следующие строки:
```
# Разрешаем локальные подключения только для определенных пользователей
local the_last_of_guss_prod prod_user md5 host the_last_of_guss_prod prod_user 127.0.0.1/32 md5 host the_last_of_guss_prod prod_user ::1/128 md5
``` 

Перезапустите PostgreSQL:
```
bash sudo systemctl restart postgresql
``` 

### 3. Резервное копирование базы данных

Настройте регулярное резервное копирование:
```
bash
# Создайте скрипт для резервного копирования
sudo nano /etc/cron.daily/backup-the-last-of-guss-db
# Добавьте следующее содержимое
#!/bin/bash BACKUP_DIR="/var/backups/postgresql" TIMESTAMP=(date +"%Y%m%d_%H%M%S") DB_NAME="the_last_of_guss_prod" BACKUP_FILE="BACKUP_DIR/DB_NAME-TIMESTAMP.sql"
# Создаем директорию для резервных копий, если она не существует
mkdir -p $BACKUP_DIR
# Создаем резервную копию
sudo -u postgres pg_dump DB_NAME >BACKUP_FILE
# Сжимаем резервную копию
gzip $BACKUP_FILE
# Удаляем старые резервные копии (оставляем копии за последние 7 дней)
find BACKUP_DIR -name "DB_NAME-*.sql.gz" -mtime +7 -delete
``` 

Сделайте скрипт исполняемым:
```
bash sudo chmod +x /etc/cron.daily/backup-the-last-of-guss-db
``` 

## Настройка WebSocket сервера

### 1. Настройка продакшн-окружения для WebSocket

Убедитесь, что порт WebSocket сервера открыт в брандмауэре:
```
bash sudo ufw allow 8080/tcp
``` 

### 2. Обеспечение стабильности WebSocket соединений

Настройте PM2 для мониторинга и автоматического перезапуска WebSocket сервера:
```
bash
# Создайте файл конфигурации PM2
cat > websocket-server.config.js << EOL module.exports = { apps: [{ name: "the-last-of-guss-websocket", script: "./dist/websocket-server.js", instances: 1, exec_mode: "fork", watch: false, max_memory_restart: "300M", env: { NODE_ENV: "production", WS_PORT: 8080 } }] } EOL
# Запустите WebSocket сервер с PM2
pm2 start websocket-server.config.js pm2 save
``` 

## Мониторинг и логирование

### 1. Настройка логирования

Настройте логирование для Node.js приложения:
```
bash
# Установите winston для логирования
cd backend npm install --save winston winston-daily-rotate-file
# Создайте директорию для логов
mkdir -p logs
``` 

### 2. Настройка мониторинга
```
bash
# Установите PM2 для мониторинга
pm2 install pm2-logrotate pm2 set pm2-logrotate:max_size 10M pm2 set pm2-logrotate:retain 7
# Настройте мониторинг с PM2
pm2 monit
``` 

### 3. Настройка оповещений
```
bash
# Установите модуль уведомлений PM2
pm2 install pm2-slack
# Настройте уведомления (замените webhook URL на ваш)
pm2 set pm2-slack:slack_url [https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK](https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK) pm2 set pm2-slack:log true pm2 set pm2-slack:error true pm2 set pm2-slack:exception true
``` 

## Автоматизация развертывания

### 1. Настройка CI/CD с помощью GitHub Actions

Создайте файл `.github/workflows/deploy.yml`:
```
yaml name: Deploy
on: push: branches: [ main ]
jobs: deploy: runs-on: ubuntu-latest steps: - uses: actions/checkout@v2
- name: Set up Node.js
  uses: actions/setup-node@v2
  with:
  node-version: '16'

- name: Install dependencies and build frontend
  run: |
  cd frontend
  npm ci
  npm run build

- name: Install dependencies and build backend
  run: |
  cd backend
  npm ci
  npm run build

- name: Deploy to production server
  uses: appleboy/ssh-action@master
  with:
  host: ${{ secrets.HOST }}
  username: ${{ secrets.USERNAME }}
  key: ${{ secrets.SSH_KEY }}
  script: |
  cd /path/to/The-Last-of-Guss
  git pull
  cd frontend
  npm ci --production
  npm run build
  cd ../backend
  npm ci --production
  npm run build
  pm2 restart the-last-of-guss-backend
  pm2 restart the-last-of-guss-websocket
  latex_unknown_tag
``` 

### 2. Автоматизация с помощью скриптов

Создайте скрипт для быстрого развертывания:
```
bash
# Создайте скрипт deploy.sh
cat > deploy.sh << EOL #!/bin/bash set -e
# Получаем последние изменения
git pull
# Сборка фронтенда
cd frontend npm ci --production npm run build
# Сборка бэкенда
cd ../backend npm ci --production npm run build
# Перезапуск сервисов
pm2 restart the-last-of-guss-backend pm2 restart the-last-of-guss-websocket
echo "Развертывание успешно завершено!" EOL
# Сделайте скрипт исполняемым
chmod +x deploy.sh
``` 

## Откат изменений

### 1. Подготовка к возможному откату
```
bash
# Создайте скрипт для отката
cat > rollback.sh << EOL #!/bin/bash set -e
# Проверяем, что указан коммит для отката
if [ -z ; then echo "Укажите коммит для отката. Использование: ./rollback.sh <commit-hash>" exit 1 fi
# Переключаемся на указанный коммит
git checkout $1
# Сборка фронтенда
cd frontend npm ci --production npm run build
# Сборка бэкенда
cd ../backend npm ci --production npm run build
# Перезапуск сервисов
pm2 restart the-last-of-guss-backend pm2 restart the-last-of-guss-websocket
echo "Откат к коммиту $1 успешно завершен!" EOL
# Сделайте скрипт исполняемым
chmod +x rollback.sh
latex_unknown_tag
``` 

### 2. Процесс отката
```
bash
# Для отката к определенному коммиту
./rollback.sh <commit-hash>
# Например
./rollback.sh a1b2c3d4e5f6
``` 

## Решение проблем

### Распространенные проблемы и их решения

#### 1. Проблемы с соединением WebSocket

**Симптом**: Фронтенд не может установить WebSocket соединение.

**Решение**:
- Проверьте, запущен ли WebSocket сервер: `pm2 status`
- Проверьте правильность URL для WebSocket в настройках фронтенда
- Проверьте настройки прокси в Nginx
- Проверьте, открыт ли порт в брандмауэре: `sudo ufw status`

#### 2. Проблемы с базой данных

**Симптом**: Ошибки подключения к базе данных.

**Решение**:
- Проверьте статус сервиса PostgreSQL: `sudo systemctl status postgresql`
- Проверьте правильность учетных данных в файле `.env`
- Проверьте права доступа пользователя базы данных
- Проверьте настройки в `pg_hba.conf`

#### 3. Проблемы с производительностью

**Симптом**: Низкая производительность или отказ сервера при высокой нагрузке.

**Решение**:
- Настройте масштабирование с PM2: `pm2 scale the-last-of-guss-backend +2`
- Оптимизируйте запросы к базе данных
- Настройте кэширование в Nginx
- Рассмотрите возможность вертикального или горизонтального масштабирования сервера

#### 4. Ошибки при развертывании

**Симптом**: Сбои в процессе автоматического развертывания.

**Решение**:
- Проверьте логи CI/CD: `cat /var/log/github-actions.log`
- Проверьте права доступа для пользователя, выполняющего развертывание
- Выполните ручное развертывание для отладки: `./deploy.sh`
- Проверьте доступность внешних зависимостей
