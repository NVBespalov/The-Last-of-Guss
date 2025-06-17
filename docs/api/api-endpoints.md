# Конечные точки API
## Обзор
Данный документ предоставляет полное описание всех конечных точек (endpoints) API системы подсчета очков, включая методы запросов, параметры, тела запросов и ответов, а также примеры использования.
## Базовая информация
- **Базовый URL**: `https://api.scoring-system.com/api/v1`
- **Формат данных**: JSON
- **Аутентификация**: Bearer-токен в заголовке `Authorization`

## Аутентификация и управление пользователями
### Регистрация пользователя
``` 
POST /auth/register
```
**Тело запроса:**
``` json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Ответ (201 Created):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-06-17T10:00:00Z"
}
```
### Авторизация
``` 
POST /auth/login
```
**Тело запроса:**
``` json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Ответ (200 OK):**
``` json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800,
  "token_type": "Bearer"
}
```
### Обновление токена
``` 
POST /auth/refresh
```
**Тело запроса:**
``` json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Ответ (200 OK):**
``` json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800,
  "token_type": "Bearer"
}
```
### Выход из системы
``` 
POST /auth/logout
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (204 No Content)**
### Получение профиля пользователя
``` 
GET /users/me
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["user"],
  "createdAt": "2025-06-17T10:00:00Z",
  "lastLoginAt": "2025-06-17T14:30:00Z"
}
```
### Обновление профиля пользователя
``` 
PUT /users/me
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Тело запроса:**
``` json
{
  "firstName": "John",
  "lastName": "Smith",
  "username": "johnsmith"
}
```
**Ответ (200 OK):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johnsmith",
  "firstName": "John",
  "lastName": "Smith",
  "roles": ["user"],
  "createdAt": "2025-06-17T10:00:00Z",
  "updatedAt": "2025-06-17T15:00:00Z"
}
```
## Управление игровыми раундами
### Получение списка раундов
``` 
GET /rounds?status=active&page=1&limit=20
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Параметры запроса:**
- `status` (опционально): фильтр по статусу (`active`, `completed`, `planned`)
- `page` (опционально): номер страницы (по умолчанию 1)
- `limit` (опционально): количество элементов на странице (по умолчанию 20)

**Ответ (200 OK):**
``` json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Раунд #123",
      "status": "active",
      "startedAt": "2025-06-17T10:00:00Z",
      "endedAt": null,
      "createdBy": "admin@example.com",
      "totalTaps": 156,
      "totalPlayers": 12
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
### Создание нового раунда
``` 
POST /rounds
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Тело запроса:**
``` json
{
  "name": "Раунд #124",
  "startImmediately": true,
  "settings": {
    "cooldownPeriod": 5,
    "maxTapsPerUser": 10
  }
}
```
**Ответ (201 Created):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Раунд #124",
  "status": "active",
  "startedAt": "2025-06-17T16:00:00Z",
  "endedAt": null,
  "createdBy": "admin@example.com",
  "settings": {
    "cooldownPeriod": 5,
    "maxTapsPerUser": 10
  }
}
```
### Получение информации о раунде
``` 
GET /rounds/{roundId}
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Раунд #124",
  "status": "active",
  "startedAt": "2025-06-17T16:00:00Z",
  "endedAt": null,
  "createdBy": "admin@example.com",
  "settings": {
    "cooldownPeriod": 5,
    "maxTapsPerUser": 10
  },
  "totalTaps": 45,
  "totalPlayers": 8,
  "topPlayers": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "username": "player1",
      "score": 120
    },
    {
      "userId": "550e8400-e29b-41d4-a716-446655440003",
      "username": "player2",
      "score": 85
    }
  ]
}
```
### Старт раунда
``` 
POST /rounds/{roundId}/start
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Раунд #124",
  "status": "active",
  "startedAt": "2025-06-17T16:05:00Z",
  "endedAt": null,
  "createdBy": "admin@example.com"
}
```
### Завершение раунда
``` 
POST /rounds/{roundId}/end
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Раунд #124",
  "status": "completed",
  "startedAt": "2025-06-17T16:05:00Z",
  "endedAt": "2025-06-17T17:05:00Z",
  "createdBy": "admin@example.com",
  "totalTaps": 156,
  "totalPlayers": 12,
  "topPlayers": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "username": "player1",
      "score": 120
    },
    {
      "userId": "550e8400-e29b-41d4-a716-446655440003",
      "username": "player2",
      "score": 85
    }
  ]
}
```
## Управление тапами и очками
### Регистрация тапа
``` 
POST /taps
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Тело запроса:**
``` json
{
  "roundId": "550e8400-e29b-41d4-a716-446655440001",
  "timestamp": "2025-06-17T16:30:00Z"
}
```
**Ответ (201 Created):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "roundId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-06-17T16:30:00Z",
  "points": 10,
  "status": "accepted"
}
```
### Получение тапов пользователя
``` 
GET /users/me/taps?roundId=550e8400-e29b-41d4-a716-446655440001&page=1&limit=20
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Параметры запроса:**
- `roundId` (опционально): фильтр по ID раунда
- `page` (опционально): номер страницы (по умолчанию 1)
- `limit` (опционально): количество элементов на странице (по умолчанию 20)

**Ответ (200 OK):**
``` json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "roundId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-06-17T16:30:00Z",
      "points": 10,
      "status": "accepted"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "roundId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-06-17T16:35:00Z",
      "points": 10,
      "status": "accepted"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "pageSize": 20,
    "pages": 1
  }
}
```
### Получение списка очков
``` 
GET /rounds/{roundId}/scores?page=1&limit=20
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Параметры запроса:**
- `page` (опционально): номер страницы (по умолчанию 1)
- `limit` (опционально): количество элементов на странице (по умолчанию 20)

**Ответ (200 OK):**
``` json
{
  "data": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "username": "player1",
      "score": 120,
      "rank": 1,
      "taps": 12
    },
    {
      "userId": "550e8400-e29b-41d4-a716-446655440003",
      "username": "player2",
      "score": 85,
      "rank": 2,
      "taps": 9
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "pageSize": 20,
    "pages": 1
  }
}
```
## Статистика и история
### Получение статистики пользователя
``` 
GET /users/me/stats
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "totalScore": 450,
  "totalRounds": 5,
  "totalTaps": 45,
  "bestRank": 1,
  "averageRank": 2.4,
  "roundsWon": 2,
  "lastActivity": "2025-06-17T16:35:00Z"
}
```
### Получение истории раундов пользователя
``` 
GET /users/me/rounds?page=1&limit=20
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Параметры запроса:**
- `page` (опционально): номер страницы (по умолчанию 1)
- `limit` (опционально): количество элементов на странице (по умолчанию 20)

**Ответ (200 OK):**
``` json
{
  "data": [
    {
      "roundId": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Раунд #124",
      "startedAt": "2025-06-17T16:05:00Z",
      "endedAt": "2025-06-17T17:05:00Z",
      "score": 20,
      "rank": 8,
      "taps": 2
    },
    {
      "roundId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Раунд #123",
      "startedAt": "2025-06-17T10:00:00Z",
      "endedAt": "2025-06-17T11:00:00Z",
      "score": 85,
      "rank": 2,
      "taps": 9
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "pageSize": 20,
    "pages": 1
  }
}
```
## Административные функции
### Получение списка пользователей (админ)
``` 
GET /admin/users?page=1&limit=20
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Параметры запроса:**
- `page` (опционально): номер страницы (по умолчанию 1)
- `limit` (опционально): количество элементов на странице (по умолчанию 20)
- `query` (опционально): поиск по email, имени или логину

**Ответ (200 OK):**
``` json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["user"],
      "status": "active",
      "createdAt": "2025-06-17T10:00:00Z",
      "lastLoginAt": "2025-06-17T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "pages": 3
  }
}
```
### Изменение ролей пользователя (админ)
``` 
PUT /admin/users/{userId}/roles
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Тело запроса:**
``` json
{
  "roles": ["user", "moderator"]
}
```
**Ответ (200 OK):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "roles": ["user", "moderator"],
  "updatedAt": "2025-06-17T16:40:00Z"
}
```
### Блокировка пользователя (админ)
``` 
PUT /admin/users/{userId}/status
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Тело запроса:**
``` json
{
  "status": "blocked",
  "reason": "Нарушение правил использования"
}
```
**Ответ (200 OK):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "status": "blocked",
  "blockReason": "Нарушение правил использования",
  "updatedAt": "2025-06-17T16:45:00Z"
}
```
### Управление игнорируемыми пользователями (админ)
``` 
PUT /admin/ignored-users
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Тело запроса:**
``` json
{
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440006",
    "550e8400-e29b-41d4-a716-446655440007"
  ]
}
```
**Ответ (200 OK):**
``` json
{
  "ignoredUsers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "username": "ignoreduser1",
      "email": "ignored1@example.com"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "username": "ignoreduser2",
      "email": "ignored2@example.com"
    }
  ],
  "updatedAt": "2025-06-17T16:50:00Z"
}
```
### Получение списка игнорируемых пользователей (админ)
``` 
GET /admin/ignored-users
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "ignoredUsers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "username": "ignoreduser1",
      "email": "ignored1@example.com"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "username": "ignoreduser2",
      "email": "ignored2@example.com"
    }
  ],
  "updatedAt": "2025-06-17T16:50:00Z"
}
```
## Webhooks
### Регистрация webhook (админ)
``` 
POST /admin/webhooks
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Тело запроса:**
``` json
{
  "url": "https://example.com/webhook",
  "events": ["round.started", "round.ended", "tap.created"],
  "secret": "webhookSecret123"
}
```
**Ответ (201 Created):**
``` json
{
  "id": "550e8400-e29b-41d4-a716-446655440008",
  "url": "https://example.com/webhook",
  "events": ["round.started", "round.ended", "tap.created"],
  "status": "active",
  "createdAt": "2025-06-17T17:00:00Z"
}
```
### Получение списка webhooks (админ)
``` 
GET /admin/webhooks
```
**Заголовки:**
``` 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Ответ (200 OK):**
``` json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "url": "https://example.com/webhook",
      "events": ["round.started", "round.ended", "tap.created"],
      "status": "active",
      "createdAt": "2025-06-17T17:00:00Z"
    }
  ]
}
```
## Коды ошибок

| HTTP-код | Описание |
| --- | --- |
| 400 | Некорректный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 409 | Конфликт (например, дублирование данных) |
| 422 | Ошибка валидации данных |
| 429 | Слишком много запросов |
| 500 | Внутренняя ошибка сервера |
## Примеры ошибок
**Некорректный запрос (400):**
``` json
{
  "status": 400,
  "code": "INVALID_REQUEST",
  "message": "Некорректный запрос",
  "details": {
    "field": "email",
    "reason": "Должен быть валидным email-адресом"
  }
}
```
**Не авторизован (401):**
``` json
{
  "status": 401,
  "code": "UNAUTHORIZED",
  "message": "Токен авторизации недействителен или истек"
}
```
**Доступ запрещен (403):**
``` json
{
  "status": 403,
  "code": "FORBIDDEN",
  "message": "У вас нет прав для выполнения данного действия"
}
```
**Ресурс не найден (404):**
``` json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Раунд с ID 550e8400-e29b-41d4-a716-446655440009 не найден"
}
```
