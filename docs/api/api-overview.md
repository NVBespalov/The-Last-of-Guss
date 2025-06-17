# Обзор API системы подсчета очков
## Введение
API системы подсчета очков предоставляет интерфейс для взаимодействия с основными функциями системы, включая управление пользователями, игровыми раундами, регистрацию тапов и получение статистики. API построено на принципах REST и использует JSON для обмена данными.
## Базовая информация
- **Базовый URL**: `https://api.scoring-system.com/api/v1`
- **Формат данных**: JSON
- **Версионирование**: через URL-путь (/api/v1/)
- **Аутентификация**: OAuth 2.0 + JWT токены

## Основные ресурсы API

| Ресурс | Описание |
| --- | --- |
| `/auth` | Аутентификация и управление токенами |
| `/users` | Управление пользователями |
| `/rounds` | Управление игровыми раундами |
| `/taps` | Регистрация тапов и начисление очков |
| `/stats` | Статистика и история игр |
| `/admin` | Административные функции |
## Методы аутентификации
API поддерживает следующие методы аутентификации:
1. **JWT токены**:
    - Access-токен передается в заголовке `Authorization: Bearer {token}`
    - Время жизни токена: 30 минут
    - Обновление через `/auth/refresh` с использованием refresh-токена

2. **OAuth 2.0**:
    - Поддержка авторизации через внешних провайдеров (Google, Facebook, GitHub)
    - Flow типа Authorization Code с PKCE для публичных клиентов

## Ограничения и квоты
- Ограничение скорости запросов: 100 запросов в минуту для обычных пользователей, 1000 запросов в минуту для административных аккаунтов
- Максимальный размер запроса: 10 МБ
- Поддержка пагинации для всех списковых эндпоинтов

## Обработка ошибок
API использует стандартные HTTP-коды состояния и возвращает детальную информацию об ошибках в формате JSON:
``` json
{
  "status": 400,
  "code": "INVALID_PARAMETER",
  "message": "Некорректный параметр 'userId'",
  "details": {
    "field": "userId",
    "reason": "Должен быть действительным UUID"
  },
  "timestamp": "2025-06-17T14:30:00Z",
  "requestId": "req-12345"
}
```
### Общие коды ошибок

| Код HTTP | Код ошибки | Описание |
| --- | --- | --- |
| 400 | INVALID_PARAMETER | Некорректный параметр в запросе |
| 401 | UNAUTHORIZED | Отсутствует или недействительный токен |
| 403 | FORBIDDEN | Недостаточно прав для выполнения операции |
| 404 | NOT_FOUND | Запрашиваемый ресурс не найден |
| 409 | CONFLICT | Конфликт при создании или обновлении ресурса |
| 429 | RATE_LIMIT_EXCEEDED | Превышен лимит запросов |
| 500 | INTERNAL_ERROR | Внутренняя ошибка сервера |
## Версионирование API
- Каждая версия API имеет свой префикс в URL (например, `/api/v1/`, `/api/v2/`)
- Поддержка предыдущих версий API осуществляется в течение 12 месяцев после выпуска новой версии
- При выпуске новой версии API публикуется миграционное руководство

## WebSocket API
Помимо REST API, система предоставляет WebSocket API для получения обновлений в реальном времени:
- **Подключение**: `wss://api.scoring-system.com/ws`
- **Аутентификация**: JWT токен передается в качестве параметра подключения
- **Каналы**:
    - `/rounds` - обновления статуса раундов
    - `/scores` - обновления счета игроков
    - `/notifications` - системные уведомления

## Примеры использования API
### Аутентификация
``` http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "secure_password"
}
```
Ответ:
``` json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800,
  "token_type": "Bearer"
}
```
### Получение списка активных раундов
``` http
GET /api/v1/rounds?status=active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Ответ:
``` json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Раунд #123",
      "status": "active",
      "startedAt": "2025-06-17T10:00:00Z",
      "createdBy": "admin@example.com"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "pages": 1
  }
}
```
## Документация API
Полная документация API доступна в формате OpenAPI (Swagger):
- **Интерактивная документация**: `https://api.scoring-system.com/docs`
- **Спецификация OpenAPI**: `https://api.scoring-system.com/openapi.json`

## SDK и клиентские библиотеки
Для упрощения работы с API предоставляются SDK для различных языков программирования:
- JavaScript/TypeScript: `npm install scoring-system-api-client`
- Python: `pip install scoring-system-api-client`
- Java: Maven/Gradle зависимость `com.scoring-system:api-client`
- Mobile SDK: для iOS и Android

## Поддержка и обратная связь
- **Техническая поддержка**: api-support@scoring-system.com
- **Документация**: [https://docs.scoring-system.com/api](https://docs.scoring-system.com/api)
- **Репозиторий с примерами**: [https://github.com/scoring-system/api-examples](https://github.com/scoring-system/api-examples)
