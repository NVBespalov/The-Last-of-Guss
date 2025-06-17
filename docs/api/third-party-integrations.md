# Интеграции со сторонними сервисами
## Обзор
Система подсчета очков предоставляет возможности интеграции с различными сторонними сервисами и платформами для расширения функциональности и обеспечения взаимодействия с внешними системами. Данный документ описывает доступные интеграции, их настройку и использование.
## Поддерживаемые интеграции
### Аутентификация и авторизация

| Сервис | Тип интеграции | Описание |
| --- | --- | --- |
| Google | OAuth 2.0 | Вход с помощью учетной записи Google |
| Facebook | OAuth 2.0 | Вход с помощью учетной записи Facebook |
| GitHub | OAuth 2.0 | Вход с помощью учетной записи GitHub |
| Microsoft | OAuth 2.0 | Вход с помощью учетной записи Microsoft |
| SAML | SAML 2.0 | Корпоративная аутентификация через SAML |
### Уведомления и коммуникация

| Сервис | Тип интеграции | Описание |
| --- | --- | --- |
| Slack | Webhooks | Отправка уведомлений о событиях в Slack |
| Discord | Webhooks | Отправка уведомлений о событиях в Discord |
| Email | SMTP | Отправка электронных писем через внешний SMTP-сервер |
| SMS | API | Отправка SMS-уведомлений через различных провайдеров |
| Push-уведомления | Firebase Cloud Messaging | Отправка push-уведомлений на мобильные устройства |
### Аналитика и мониторинг

| Сервис | Тип интеграции | Описание |
| --- | --- | --- |
| Google Analytics | JavaScript SDK | Отслеживание пользовательской активности на веб-интерфейсе |
| Sentry | SDK | Мониторинг ошибок и производительности |
| Prometheus | Metrics API | Сбор метрик для мониторинга производительности |
| Grafana | Dashboards | Визуализация метрик и логов |
| Datadog | Agent | Комплексный мониторинг системы |
### Хранение и обработка данных

| Сервис | Тип интеграции | Описание |
| --- | --- | --- |
| AWS S3 | API | Хранение файлов и резервных копий |
| Google Cloud Storage | API | Хранение файлов и резервных копий |
| Redis | Client | Кэширование и обмен данными между серверами |
| Elasticsearch | API | Полнотекстовый поиск и логирование |
| Apache Kafka | Client | Обработка потоков событий |
### Экспорт и импорт данных

| Сервис | Тип интеграции | Описание |
| --- | --- | --- |
| Excel | Экспорт/Импорт | Экспорт и импорт данных в формате Excel |
| CSV | Экспорт/Импорт | Экспорт и импорт данных в формате CSV |
| Google Sheets | API | Интеграция с Google Sheets для экспорта данных |
| Tableau | Connector | Подключение к Tableau для визуализации данных |
| Power BI | Connector | Подключение к Power BI для визуализации данных |
## Настройка интеграций
### Настройка OAuth 2.0 провайдеров
Для настройки OAuth 2.0 провайдеров требуется зарегистрировать приложение на соответствующей платформе и получить Client ID и Client Secret.
#### Пример настройки Google OAuth
1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Настройте OAuth consent screen
3. Создайте OAuth Client ID для веб-приложения
4. Укажите разрешенные URI перенаправления (redirect URIs)
5. В административном интерфейсе системы подсчета очков:
   - Перейдите в раздел "Настройки" -> "Интеграции" -> "OAuth Providers"
   - Добавьте нового провайдера "Google"
   - Введите полученные Client ID и Client Secret
   - Настройте области доступа (scopes): `email`, `profile`
   - Сохраните настройки

### Настройка интеграции со Slack
1. Создайте приложение в [Slack API](https://api.slack.com/apps)
2. Настройте Incoming Webhooks
3. Создайте новый webhook для нужного канала
4. В административном интерфейсе системы:
   - Перейдите в раздел "Настройки" -> "Интеграции" -> "Уведомления" -> "Slack"
   - Введите полученный webhook URL
   - Настройте типы событий для отправки уведомлений
   - Настройте формат сообщений
   - Сохраните настройки

### Настройка интеграции с Sentry
1. Создайте проект в [Sentry](https://sentry.io/)
2. Получите DSN для проекта
3. В административном интерфейсе системы:
   - Перейдите в раздел "Настройки" -> "Интеграции" -> "Мониторинг" -> "Sentry"
   - Введите полученный DSN
   - Настройте уровень логирования ошибок
   - Сохраните настройки

## API для управления интеграциями
### Получение списка настроенных интеграций
``` http
GET /api/v1/admin/integrations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "oauth": [
    {
      "provider": "google",
      "enabled": true,
      "clientId": "123456789-abcdef.apps.googleusercontent.com",
      "scopes": ["email", "profile"]
    },
    {
      "provider": "facebook",
      "enabled": false,
      "clientId": "",
      "scopes": []
    }
  ],
  "notifications": [
    {
      "provider": "slack",
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
      "events": ["round.started", "round.ended"]
    }
  ],
  "monitoring": [
    {
      "provider": "sentry",
      "enabled": true,
      "dsn": "https://abcdef1234567890@sentry.io/1234567",
      "environment": "production"
    }
  ],
  "storage": [
    {
      "provider": "aws_s3",
      "enabled": true,
      "bucket": "scoring-system-backups",
      "region": "us-east-1"
    }
  ],
  "export": [
    {
      "provider": "google_sheets",
      "enabled": false
    }
  ]
}
```
### Настройка OAuth провайдера
``` http
PUT /api/v1/admin/integrations/oauth/{provider}
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "enabled": true,
  "clientId": "123456789-abcdef.apps.googleusercontent.com",
  "clientSecret": "abcdefghijklmnopqrstuvwxyz",
  "scopes": ["email", "profile"],
  "redirectUri": "https://scoring-system.com/auth/callback/google"
}
```
**Ответ (200 OK):**
``` json
{
  "provider": "google",
  "enabled": true,
  "clientId": "123456789-abcdef.apps.googleusercontent.com",
  "scopes": ["email", "profile"],
  "redirectUri": "https://scoring-system.com/auth/callback/google"
}
```
### Настройка интеграции уведомлений
``` http
PUT /api/v1/admin/integrations/notifications/{provider}
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "enabled": true,
  "webhookUrl": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
  "events": ["round.started", "round.ended", "tap.created"],
  "messageTemplate": {
    "round.started": "Раунд *{round_name}* начался!",
    "round.ended": "Раунд *{round_name}* завершен! Победитель: *{winner_name}* с результатом {winner_score} очков."
  }
}
```
**Ответ (200 OK):**
``` json
{
  "provider": "slack",
  "enabled": true,
  "webhookUrl": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
  "events": ["round.started", "round.ended", "tap.created"]
}
```
## Примеры использования интеграций
### Пример авторизации через Google
1. Пользователь нажимает кнопку "Войти через Google"
2. Система перенаправляет пользователя на URL:
``` 
   https://accounts.google.com/o/oauth2/auth?
   client_id=123456789-abcdef.apps.googleusercontent.com&
   redirect_uri=https://scoring-system.com/auth/callback/google&
   response_type=code&
   scope=email+profile&
   state=random_state_token
```
1. Пользователь авторизуется в Google и дает разрешение на доступ
2. Google перенаправляет пользователя обратно на указанный redirect_uri с кодом авторизации
3. Система обменивает код на access_token через запрос к Google API
4. Система получает информацию о пользователе с помощью полученного токена
5. Система создает или обновляет учетную запись пользователя и выдает JWT токены

### Пример отправки уведомления в Slack
При завершении раунда система отправляет webhook-запрос на настроенный URL Slack:
``` http
POST https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
Content-Type: application/json

{
  "text": "Раунд *Раунд #124* завершен! Победитель: *player1* с результатом 120 очков.",
  "attachments": [
    {
      "title": "Детали раунда",
      "fields": [
        {
          "title": "Общее количество тапов",
          "value": "156",
          "short": true
        },
        {
          "title": "Количество участников",
          "value": "12",
          "short": true
        },
        {
          "title": "Продолжительность",
          "value": "60 минут",
          "short": true
        }
      ],
      "footer": "Система подсчета очков",
      "ts": 1686932400
    }
  ]
}
```
### Пример экспорта данных в Google Sheets
1. Администратор выбирает "Экспорт в Google Sheets" в административном интерфейсе
2. Система запрашивает авторизацию в Google (если еще не авторизован)
3. Система создает новую таблицу или использует существующую
4. Система экспортирует данные о раундах и очках в таблицу
5. Система предоставляет ссылку на созданную таблицу

## Ограничения и требования безопасности
### Безопасность интеграций
- Все учетные данные для интеграций хранятся в зашифрованном виде
- Доступ к настройкам интеграций имеют только пользователи с ролью "admin" или "superadmin"
- Все интеграции используют защищенные соединения (HTTPS)
- Для интеграций с третьими сервисами применяется принцип минимальных привилегий

### Ограничения
- Максимальное количество интеграций уведомлений: 10
- Максимальное количество OAuth провайдеров: 5
- Частота отправки уведомлений: не более 100 в минуту
- Размер экспортируемых данных: не более 1 ГБ
- Время выполнения экспорта: не более 10 минут

## Устранение неполадок
### Проверка статуса интеграций
``` http
GET /api/v1/admin/integrations/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "oauth": {
    "google": {
      "status": "connected",
      "lastChecked": "2025-06-17T15:00:00Z"
    },
    "facebook": {
      "status": "not_configured"
    }
  },
  "notifications": {
    "slack": {
      "status": "connected",
      "lastDelivery": "2025-06-17T14:45:00Z",
      "deliverySuccess": true
    }
  },
  "monitoring": {
    "sentry": {
      "status": "connected",
      "lastEvent": "2025-06-17T14:30:00Z"
    }
  },
  "storage": {
    "aws_s3": {
      "status": "connected",
      "lastBackup": "2025-06-17T12:00:00Z",
      "availableSpace": "980 GB"
    }
  }
}
```
### Журнал событий интеграций
``` http
GET /api/v1/admin/integrations/logs?provider=slack&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "provider": "slack",
      "event": "notification.sent",
      "status": "success",
      "details": {
        "eventType": "round.ended",
        "roundId": "550e8400-e29b-41d4-a716-446655440001",
        "timestamp": "2025-06-17T14:45:00Z"
      },
      "createdAt": "2025-06-17T14:45:01Z"
    }
  ],
  "pagination": {
    "total": 158,
    "page": 1,
    "pageSize": 20,
    "pages": 8
  }
}
```
### Тестирование интеграций
``` http
POST /api/v1/admin/integrations/notifications/slack/test
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "event": "round.ended",
  "data": {
    "round_name": "Тестовый раунд",
    "winner_name": "тестовый_пользователь",
    "winner_score": 100
  }
}
```
**Ответ (200 OK):**
``` json
{
  "success": true,
  "message": "Тестовое уведомление успешно отправлено",
  "deliveryId": "550e8400-e29b-41d4-a716-446655440021"
}
```
