# Руководство по установке

## Обзор

Данное руководство описывает процесс установки, настройки и запуска системы подсчета очков. Руководство предназначено для администраторов системы и содержит подробные инструкции по развертыванию как в локальной среде для разработки и тестирования, так и в продакшн-окружении.

## Системные требования

### Минимальные требования

- **Процессор**: 2+ ядра, 2.0+ ГГц
- **Оперативная память**: 4 ГБ
- **Дисковое пространство**: 20 ГБ SSD
- **Операционная система**: Ubuntu 22.04 LTS / CentOS 8 / Windows Server 2019
- **База данных**: PostgreSQL 14+
- **Node.js**: 16+ LTS

### Рекомендуемые требования для продакшн-среды

- **Процессор**: 4+ ядра, 2.5+ ГГц
- **Оперативная память**: 8+ ГБ
- **Дисковое пространство**: 50+ ГБ SSD
- **Операционная система**: Ubuntu 22.04 LTS
- **База данных**: PostgreSQL 14+ с репликацией
- **Redis**: 6+ для кэширования и обмена сообщениями
- **Node.js**: 18+ LTS
- **Балансировщик нагрузки**: Nginx

## Предварительные требования

Перед началом установки убедитесь, что на сервере установлены:

1. Node.js (версия 16 LTS или выше)
2. npm (версия 8 или выше)
3. PostgreSQL (версия 14 или выше)
4. Git
5. (Опционально) Redis (версия 6 или выше)
6. (Опционально) Nginx для продакшн-среды

## Установка в локальной среде

### Шаг 1: Клонирование репозитория

```bash
git clone https://github.com/scoring-system/scoring-system.git
cd scoring-system
```
```
### Шаг 2: Установка зависимостей
``` bash
# Установка зависимостей для серверной части
cd server
npm install

# Установка зависимостей для клиентской части
cd ../client
npm install
```
### Шаг 3: Настройка базы данных
1. Создайте базу данных в PostgreSQL:
``` bash
sudo -u postgres psql
```

``` sql
CREATE DATABASE scoring_system;
CREATE USER scoring_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE scoring_system TO scoring_user;
\q
```
1. Настройте переменные окружения:
``` bash
cd ../server
cp .env.example .env
```
Отредактируйте файл `.env`, указав параметры подключения к базе данных:
``` 
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoring_system
DB_USER=scoring_user
DB_PASSWORD=your_password
```
### Шаг 4: Миграция базы данных
``` bash
cd server
npm run migrate
```
### Шаг 5: Запуск в режиме разработки
``` bash
# Запуск серверной части
cd server
npm run dev

# В отдельном терминале запустите клиентскую часть
cd client
npm run dev
```
Сервер будет доступен по адресу `http://localhost:3000`, а клиентское приложение по адресу `http://localhost:8080`.
## Установка в продакшн-среде
### Шаг 1: Подготовка сервера
Обновите пакеты и установите необходимые зависимости:
``` bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx
```
### Шаг 2: Установка Node.js
``` bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```
Проверьте установку:
``` bash
node -v
npm -v
```
### Шаг 3: Установка PostgreSQL
``` bash
sudo apt install -y postgresql postgresql-contrib
```
Настройте базу данных:
``` bash
sudo -u postgres psql
```

``` sql
CREATE DATABASE scoring_system;
CREATE USER scoring_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE scoring_system TO scoring_user;
\q
```
### Шаг 4: Установка Redis (опционально, но рекомендуется)
``` bash
sudo apt install -y redis-server
```
Настройте Redis для автозапуска:
``` bash
sudo systemctl enable redis-server
```
### Шаг 5: Создание пользователя для приложения
``` bash
sudo adduser --system --group scoring
sudo mkdir -p /var/www/scoring-system
sudo chown scoring:scoring /var/www/scoring-system
```
### Шаг 6: Клонирование репозитория
``` bash
cd /var/www/scoring-system
sudo -u scoring git clone https://github.com/scoring-system/scoring-system.git .
```
### Шаг 7: Установка зависимостей и сборка
``` bash
# Установка зависимостей для серверной части
cd /var/www/scoring-system/server
sudo -u scoring npm install --production

# Установка зависимостей и сборка клиентской части
cd /var/www/scoring-system/client
sudo -u scoring npm install
sudo -u scoring npm run build
```
### Шаг 8: Настройка переменных окружения
``` bash
cd /var/www/scoring-system/server
sudo -u scoring cp .env.example .env
sudo -u scoring nano .env
```
Настройте переменные окружения для продакшн-среды:
``` 
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoring_system
DB_USER=scoring_user
DB_PASSWORD=your_secure_password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_very_secure_random_string
JWT_REFRESH_SECRET=another_very_secure_random_string
JWT_EXPIRY=30m
JWT_REFRESH_EXPIRY=7d

CORS_ORIGIN=https://your-domain.com
```
### Шаг 9: Настройка PM2 для управления процессами
Установите PM2 глобально:
``` bash
sudo npm install -g pm2
```
Создайте файл конфигурации PM2:
``` bash
cd /var/www/scoring-system
sudo -u scoring nano ecosystem.config.js
```
Содержимое файла:
``` javascript
module.exports = {
  apps: [
    {
      name: 'scoring-api',
      cwd: '/var/www/scoring-system/server',
      script: 'index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```
Запустите приложение через PM2:
``` bash
cd /var/www/scoring-system
sudo -u scoring pm2 start ecosystem.config.js
```
Настройте автозапуск PM2:
``` bash
sudo -u scoring pm2 save
sudo -u scoring pm2 startup
```
Скопируйте и выполните команду, которую выдаст PM2.
### Шаг 10: Настройка Nginx
Создайте конфигурационный файл Nginx:
``` bash
sudo nano /etc/nginx/sites-available/scoring-system
```
Содержимое файла:
``` nginx
server {
    listen 80;
    server_name your-domain.com;

    # Перенаправление на HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';

    # Статические файлы клиентского приложения
    location / {
        root /var/www/scoring-system/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API запросы
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

    # WebSocket соединения
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /var/www/scoring-system/client/dist;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```
Активируйте конфигурацию:
``` bash
sudo ln -s /etc/nginx/sites-available/scoring-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
### Шаг 11: Настройка SSL с Let's Encrypt
Установите Certbot:
``` bash
sudo apt install -y certbot python3-certbot-nginx
```
Получите SSL-сертификат:
``` bash
sudo certbot --nginx -d your-domain.com
```
### Шаг 12: Настройка брандмауэра
``` bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```
### Шаг 13: Миграция базы данных
``` bash
cd /var/www/scoring-system/server
sudo -u scoring npm run migrate
```
### Шаг 14: Создание административного пользователя
``` bash
cd /var/www/scoring-system/server
sudo -u scoring npm run create-admin
```
Следуйте инструкциям для создания административного пользователя.
## Обновление системы
### Обновление в локальной среде
``` bash
cd scoring-system
git pull

# Обновление серверных зависимостей
cd server
npm install
npm run migrate

# Обновление клиентских зависимостей
cd ../client
npm install
```
### Обновление в продакшн-среде
``` bash
cd /var/www/scoring-system
sudo -u scoring git pull

# Обновление серверных зависимостей
cd server
sudo -u scoring npm install --production
sudo -u scoring npm run migrate

# Обновление клиентских зависимостей и пересборка
cd ../client
sudo -u scoring npm install
sudo -u scoring npm run build

# Перезапуск приложения
cd ..
sudo -u scoring pm2 restart all
```
## Резервное копирование
### Резервное копирование базы данных
``` bash
# Создание директории для резервных копий
sudo mkdir -p /var/backups/scoring-system
sudo chown scoring:scoring /var/backups/scoring-system

# Создание резервной копии
sudo -u postgres pg_dump scoring_system | gzip > /var/backups/scoring-system/db_backup_$(date +\%Y\%m\%d).sql.gz
```
### Автоматическое резервное копирование через cron
``` bash
sudo -u scoring crontab -e
```
Добавьте следующую строку для ежедневного резервного копирования в 2:00:
``` 
0 2 * * * /usr/bin/pg_dump scoring_system | gzip > /var/backups/scoring-system/db_backup_$(date +\%Y\%m\%d).sql.gz
```
## Решение проблем
### Проверка логов
``` bash
# Логи PM2
pm2 logs

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Системные логи
sudo journalctl -u nginx
sudo journalctl -u postgresql
sudo journalctl -u redis-server
```
### Частые проблемы и их решения
#### Не удается подключиться к базе данных
1. Проверьте статус PostgreSQL:
``` bash
   sudo systemctl status postgresql
```
1. Проверьте настройки подключения в файле `.env`.
2. Проверьте права доступа пользователя базы данных:
``` bash
   sudo -u postgres psql -c "SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname = 'scoring_user';"
```
#### Приложение не запускается
1. Проверьте статус PM2:
``` bash
   pm2 status
```
1. Проверьте логи приложения:
``` bash
   pm2 logs scoring-api
```
1. Убедитесь, что все зависимости установлены:
``` bash
   cd /var/www/scoring-system/server
   sudo -u scoring npm install
```
#### Не работает WebSocket соединение
1. Убедитесь, что настройки Nginx правильно настроены для проксирования WebSocket:
``` bash
   sudo nginx -t
```
1. Проверьте логи Nginx на наличие ошибок.

## Дополнительные настройки
### Настройка логирования
Создайте директорию для логов:
``` bash
sudo mkdir -p /var/log/scoring-system
sudo chown scoring:scoring /var/log/scoring-system
```
Настройте логирование в файле `.env`:
``` 
LOG_LEVEL=info
LOG_FILE=/var/log/scoring-system/app.log
```
### Настройка ротации логов
Установите logrotate:
``` bash
sudo apt install -y logrotate
```
Создайте конфигурационный файл:
``` bash
sudo nano /etc/logrotate.d/scoring-system
```
Содержимое файла:
``` 
/var/log/scoring-system/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 scoring scoring
    sharedscripts
    postrotate
        touch /var/www/scoring-system/tmp/restart.txt
    endscript
}
```
### Настройка мониторинга
Для мониторинга системы рекомендуется использовать Prometheus и Grafana.
## Многосерверное развертывание
Для развертывания системы на нескольких серверах рекомендуется следующая архитектура:
1. **Балансировщик нагрузки** - Nginx или HAProxy
2. **Несколько серверов приложений** с одинаковой конфигурацией
3. **Кластер PostgreSQL** с репликацией (master-slave или master-master)
4. **Redis** для обмена данными между серверами и кэширования

Подробные инструкции по многосерверному развертыванию см. в документе "Руководство по развертыванию на нескольких серверах".
## Заключение
После выполнения всех шагов система подсчета очков должна быть успешно установлена и настроена. Для проверки работоспособности откройте веб-браузер и перейдите по адресу вашего сервера. Вы должны увидеть страницу входа в систему.
Если у вас возникли проблемы при установке или настройке, обратитесь к разделу "Решение проблем" или свяжитесь с технической поддержкой.
