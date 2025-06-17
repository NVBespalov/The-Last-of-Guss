# Webhooks
## Обзор
Система подсчета очков предоставляет механизм webhooks для отправки уведомлений о событиях в режиме реального времени на указанные URL-адреса. Это позволяет интегрировать систему с внешними сервисами и реагировать на события без необходимости постоянно опрашивать API.
## Основные концепции
### Что такое webhook?
Webhook — это HTTP-обратный вызов: HTTP-запрос, который происходит, когда в системе происходит определенное событие. Это "обратная" форма API, где вместо того, чтобы ваше приложение опрашивало систему, система уведомляет ваше приложение, когда происходит событие.
### Поддерживаемые события

| Тип события | Описание |
| --- | --- |
| `round.created` | Создан новый раунд |
| `round.started` | Раунд запущен |
| `round.ended` | Раунд завершен |
| `tap.created` | Зарегистрирован новый тап |
| `user.registered` | Зарегистрирован новый пользователь |
| `user.blocked` | Пользователь заблокирован |
| `user.role_changed` | Изменены роли пользователя |
| `score.updated` | Обновлен счет игрока |
## Настройка webhook
### Регистрация webhook
Для регистрации webhook необходимо отправить POST-запрос на `/api/v1/admin/webhooks` с указанием URL-адреса и списка событий, на которые вы хотите подписаться:
``` http
POST /api/v1/admin/webhooks
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "url": "https://example.com/webhook",
  "events": ["round.started", "round.ended", "tap.created"],
  "secret": "your_secret_key"
}
```
**Параметры:**
- `url` (обязательный): URL-адрес, на который будут отправляться webhook-уведомления
- `events` (обязательный): Массив типов событий, на которые вы хотите подписаться
- `secret` (обязательный): Секретный ключ для подписи запросов
- `description` (опциональный): Описание webhook для удобства идентификации

### Управление webhook
#### Получение списка зарегистрированных webhooks
``` http
GET /api/v1/admin/webhooks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
#### Получение информации о конкретном webhook
``` http
GET /api/v1/admin/webhooks/{webhookId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
#### Обновление webhook
``` http
PUT /api/v1/admin/webhooks/{webhookId}
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "url": "https://example.com/webhook/new",
  "events": ["round.started", "round.ended"],
  "secret": "new_secret_key"
}
```
#### Удаление webhook
``` http
DELETE /api/v1/admin/webhooks/{webhookId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
## Формат webhook-уведомлений
Каждое webhook-уведомление отправляется в виде HTTP POST-запроса на указанный URL-адрес со следующими данными:
### Заголовки
- `Content-Type: application/json`
- `X-Webhook-Event`: Тип события (например, `round.started`)
- `X-Webhook-ID`: Уникальный идентификатор webhook-уведомления
- `X-Webhook-Timestamp`: Временная метка события в формате ISO 8601
- `X-Webhook-Signature`: HMAC SHA-256 подпись для проверки подлинности запроса

### Тело запроса
Тело запроса содержит информацию о событии в формате JSON:
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "event": "round.started",
  "created_at": "2025-06-17T14:30:00Z",
  "data": {
    "round_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Раунд #124",
    "started_at": "2025-06-17T14:30:00Z",
    "created_by": "admin@example.com"
  }
}
```
Поле `data` содержит информацию, специфичную для конкретного типа события.
## Примеры данных для различных типов событий
### round.created
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "event": "round.created",
  "created_at": "2025-06-17T14:00:00Z",
  "data": {
    "round_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Раунд #124",
    "created_at": "2025-06-17T14:00:00Z",
    "created_by": "admin@example.com",
    "settings": {
      "cooldownPeriod": 5,
      "maxTapsPerUser": 10
    }
  }
}
```
### round.started
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440011",
  "event": "round.started",
  "created_at": "2025-06-17T14:30:00Z",
  "data": {
    "round_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Раунд #124",
    "started_at": "2025-06-17T14:30:00Z",
    "created_by": "admin@example.com"
  }
}
```
### round.ended
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440012",
  "event": "round.ended",
  "created_at": "2025-06-17T15:30:00Z",
  "data": {
    "round_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Раунд #124",
    "started_at": "2025-06-17T14:30:00Z",
    "ended_at": "2025-06-17T15:30:00Z",
    "total_taps": 156,
    "total_players": 12,
    "top_players": [
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "player1",
        "score": 120
      },
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440003",
        "username": "player2",
        "score": 85
      }
    ]
  }
}
```
### tap.created
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440013",
  "event": "tap.created",
  "created_at": "2025-06-17T14:45:00Z",
  "data": {
    "tap_id": "550e8400-e29b-41d4-a716-446655440004",
    "round_id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "timestamp": "2025-06-17T14:45:00Z",
    "points": 10,
    "status": "accepted"
  }
}
```
## Безопасность webhook
### Проверка подлинности запросов
Для обеспечения безопасности webhook все запросы подписываются с использованием HMAC SHA-256. Подпись создается путем хеширования всего тела запроса с использованием секретного ключа, указанного при регистрации webhook.
Для проверки подлинности запроса:
1. Получите значение заголовка `X-Webhook-Signature`
2. Создайте HMAC SHA-256 хеш тела запроса с использованием вашего секретного ключа
3. Сравните полученный хеш с значением заголовка `X-Webhook-Signature`

### Пример проверки подписи (JavaScript)
``` javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// В обработчике webhook
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'your_secret_key';
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Недействительная подпись' });
  }
  
  // Обработка webhook-уведомления
  const event = req.body.event;
  const data = req.body.data;
  
  // ...
  
  res.status(200).json({ received: true });
});
```
## Рекомендации по обработке webhook
1. **Быстро отвечайте на запросы**: Ваш обработчик webhook должен быстро отвечать с HTTP-кодом 200 или 2xx, чтобы подтвердить получение уведомления. Если обработка данных занимает много времени, выполняйте ее асинхронно.
2. **Обрабатывайте повторные уведомления**: Система может повторно отправлять уведомления в случае отсутствия ответа или ошибки. Ваш обработчик должен быть идемпотентным (повторная обработка одного и того же уведомления не должна приводить к дублированию данных).
3. **Проверяйте подпись**: Всегда проверяйте подпись webhook для подтверждения подлинности запроса.
4. **Обрабатывайте ошибки**: Если ваш обработчик не может обработать уведомление, верните соответствующий HTTP-код ошибки.
5. **Ведите журнал**: Сохраняйте информацию о полученных webhook-уведомлениях для отладки и аудита.

## Мониторинг и отладка
### Просмотр истории отправленных webhook-уведомлений
``` http
GET /api/v1/admin/webhooks/{webhookId}/deliveries
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
### Повторная отправка webhook-уведомления
``` http
POST /api/v1/admin/webhooks/{webhookId}/deliveries/{deliveryId}/redeliver
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
### Тестирование webhook
``` http
POST /api/v1/admin/webhooks/{webhookId}/test
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "event": "round.started"
}
```
## Ограничения
- Максимальное время ожидания ответа на webhook-уведомление: 5 секунд
- Максимальное количество попыток повторной отправки: 5
- Интервал между повторными попытками: 5, 15, 30, 60, 120 секунд (экспоненциальная задержка)
- Максимальное количество webhook на одного клиента: 10
