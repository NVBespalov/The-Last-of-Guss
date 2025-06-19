# Аутентификация в API

## Обзор

Данный документ описывает механизмы аутентификации и авторизации, используемые в API системы подсчета очков, включая JWT-токены и базовые функции управления пользователями.

## Методы аутентификации

### JWT-токены

Основной метод аутентификации в API - использование JSON Web Tokens (JWT).

#### Процесс аутентификации:

1. Клиент отправляет учетные данные на эндпоинт `/auth/login`
2. Сервер проверяет учетные данные и возвращает пару токенов:
   - **Access токен**: короткоживущий токен (30 минут) для доступа к API
   - **Refresh токен**: долгоживущий токен (7 дней) для обновления access токена

#### Структура JWT токена:

header.payload.signature
**Пример заголовка (header)**:
```json
{
"alg": "HS256",
"typ": "JWT"
}
```
**Пример полезной нагрузки (payload)**:
```json
{
  "sub": "1234567890",
  "email": "user@example.com",
  "role": "survivor",
  "iat": 1516239022,
  "exp": 1516240822
}
```

#### Использование JWT токенов:
Access токен должен быть включен в каждый запрос API в заголовке Authorization:
```
 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
#### Обновление токенов:
Когда access токен истекает, клиент может получить новую пару токенов, отправив refresh токен на эндпоинт `/auth/refresh`:
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
## Основные эндпоинты аутентификации

### Вход в систему
```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "secure_password"
}
```
**Ответ:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Иван Иванов",
      "role": "survivor"
    }
  },
  "timestamp": "2025-06-18T12:00:00.000Z"
}
```
### Регистрация пользователя
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "secure_password",
  "name": "Иван Иванов"
}
```
### Обновление токенов
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
### Выход из системы
```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
### Получение профиля пользователя
```http
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
### Проверка валидности токена
```http
POST /auth/verify-token
Content-Type: application/json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
## Управление ролями

### Изменение роли пользователя (только для администраторов)
```http
PATCH /auth/users/:id/role
Authorization: Bearer eyJhbGциOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "roleCode": "nikita"
}
```
## Ролевая модель и права доступа

### Доступные роли:
- **admin**: полный доступ к системе и управление всеми функциями
- **nikita**: специальная роль с расширенными правами управления
- **survivor**: базовый доступ к игровым функциям системы

### Проверка прав доступа:
API проверяет права доступа на основе:
- Роли пользователя
- Конкретных разрешений, назначенных пользователю
- Владения ресурсом (например, пользователь может редактировать только свой профиль)

## Структура ответов API

Все ответы API имеют единообразную структуру:

**Успешный ответ:**
```json
{
  "success": true,
  "data": {  },
  "timestamp": "2025-06-18T12:00:00.000Z"
}
```
**Ответ с ошибкой:**
```json
{
  "success": false,
  "error": {
    "message": "Описание ошибки",
    "code": "ERROR_CODE"
  },
  "timestamp": "2025-06-18T12:00:00.000Z"
}
```
## Безопасность аутентификации

### Защита от атак:
- **Ограничение попыток входа**: Временная блокировка после нескольких неудачных попыток
- **Мониторинг**: Необычные шаблоны аутентификации отслеживаются
- **Валидация токенов**: Проверка подлинности и срока действия токенов

### Журналирование:
Все действия, связанные с аутентификацией, журналируются:
- Успешные и неудачные попытки входа
- Обновление токенов
- Выход из системы
- Изменение ролей пользователей

## Рекомендации для клиентов

- Храните токены в безопасном месте (HttpOnly cookies для веб-приложений)
- Реализуйте автоматическое обновление токенов при их истечении
- Отправляйте запрос на logout при выходе пользователя из приложения
- Всегда используйте HTTPS для передачи токенов
- Реализуйте обработку ошибок 401 Unauthorized для перенаправления на страницу входа

## Коды ошибок

- `401 Unauthorized` - Требуется авторизация или токен недействителен
- `403 Forbidden` - Недостаточно прав для выполнения операции
- `409 Conflict` - Пользователь с таким email уже существует
- `422 Unprocessable Entity` - Ошибка валидации данных

## Примечания

Данная версия API поддерживает базовые функции аутентификации с использованием JWT токенов. Планируется добавление:
- OAuth 2.0 аутентификации через внешних провайдеров
- Многофакторной аутентификации (MFA)
- Расширенного управления токенами
```
