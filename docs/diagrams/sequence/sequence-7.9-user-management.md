# Sequence-диаграмма 7.9: Управление пользователями
## Описание
Данная диаграмма последовательности описывает процессы управления пользователями в системе подсчета очков, включая создание, обновление, просмотр и удаление пользователей администраторами, а также управление ролями и правами доступа.
## Диаграмма последовательности: Создание пользователя администратором
``` mermaid
sequenceDiagram
    actor Admin as Администратор
    participant Client as Клиент (Админ-панель)
    participant API as API Gateway
    participant Auth as Сервис аутентификации
    participant UserMgmt as Сервис управления пользователями
    participant DB as База данных
    participant Email as Сервис уведомлений
    
    Admin->>Client: Заполняет форму создания пользователя
    Client->>API: POST /api/v1/admin/users
    API->>Auth: Проверка прав доступа администратора
    
    alt Недостаточно прав
        Auth-->>API: 403 Forbidden
        API-->>Client: Ошибка доступа
        Client-->>Admin: Отображение ошибки
    else Достаточно прав
        Auth-->>API: Доступ разрешен
        API->>UserMgmt: Создание пользователя
        UserMgmt->>DB: Проверка уникальности email/логина
        
        alt Email/Логин уже используется
            DB-->>UserMgmt: Конфликт
            UserMgmt-->>API: 409 Conflict
            API-->>Client: Ошибка: Email/Логин уже используется
            Client-->>Admin: Отображение ошибки
        else Email/Логин свободны
            UserMgmt->>UserMgmt: Генерация временного пароля
            UserMgmt->>DB: Сохранение пользователя
            DB-->>UserMgmt: Пользователь сохранен
            UserMgmt->>Email: Отправка приглашения с учетными данными
            UserMgmt-->>API: 201 Created
            API-->>Client: Пользователь создан
            Client-->>Admin: Подтверждение создания
        end
    end
```
## Диаграмма последовательности: Управление ролями пользователя
``` mermaid
sequenceDiagram
    actor Admin as Администратор
    participant Client as Клиент (Админ-панель)
    participant API as API Gateway
    participant Auth as Сервис аутентификации
    participant UserMgmt as Сервис управления пользователями
    participant DB as База данных
    participant Email as Сервис уведомлений
    
    Admin->>Client: Выбирает пользователя и изменяет роли
    Client->>API: PUT /api/v1/admin/users/{userId}/roles
    API->>Auth: Проверка прав доступа администратора
    
    alt Недостаточно прав
        Auth-->>API: 403 Forbidden
        API-->>Client: Ошибка доступа
        Client-->>Admin: Отображение ошибки
    else Достаточно прав
        Auth-->>API: Доступ разрешен
        API->>UserMgmt: Обновление ролей пользователя
        UserMgmt->>DB: Обновление ролей в БД
        DB-->>UserMgmt: Роли обновлены
        UserMgmt->>Email: Уведомление пользователя об изменении ролей
        UserMgmt-->>API: 200 OK
        API-->>Client: Роли обновлены
        Client-->>Admin: Подтверждение обновления
    end
```
## Диаграмма последовательности: Блокировка пользователя
``` mermaid
sequenceDiagram
    actor Admin as Администратор
    participant Client as Клиент (Админ-панель)
    participant API as API Gateway
    participant Auth as Сервис аутентификации
    participant UserMgmt as Сервис управления пользователями
    participant DB as База данных
    participant Email as Сервис уведомлений
    
    Admin->>Client: Выбирает пользователя и нажимает "Заблокировать"
    Client->>API: PUT /api/v1/admin/users/{userId}/status
    API->>Auth: Проверка прав доступа администратора
    
    alt Недостаточно прав
        Auth-->>API: 403 Forbidden
        API-->>Client: Ошибка доступа
        Client-->>Admin: Отображение ошибки
    else Достаточно прав
        Auth-->>API: Доступ разрешен
        API->>UserMgmt: Блокировка пользователя
        UserMgmt->>DB: Изменение статуса пользователя
        DB-->>UserMgmt: Статус обновлен
        UserMgmt->>Auth: Инвалидация всех токенов пользователя
        UserMgmt->>Email: Уведомление пользователя о блокировке
        UserMgmt-->>API: 200 OK
        API-->>Client: Пользователь заблокирован
        Client-->>Admin: Подтверждение блокировки
    end
```
## Диаграмма последовательности: Просмотр списка пользователей
```mermaid
sequenceDiagram
    actor Admin as Администратор
    participant Client as Клиент (Админ-панель)
    participant API as API Gateway
    participant Auth as Сервис аутентификации
    participant UserMgmt as Сервис управления пользователями
    participant DB as База данных
    
    Admin->>Client: Открывает страницу управления пользователями
    Client->>API: GET /api/v1/admin/users?page=1&limit=20
    API->>Auth: Проверка прав доступа администратора
    
    alt Недостаточно прав
        Auth-->>API: 403 Forbidden
        API-->>Client: Ошибка доступа
        Client-->>Admin: Отображение ошибки
    else Достаточно прав
        Auth-->>API: Доступ разрешен
        API->>UserMgmt: Запрос списка пользователей
        UserMgmt->>DB: Запрос данных с пагинацией
        DB-->>UserMgmt: Данные пользователей
        UserMgmt-->>API: 200 OK (список пользователей)
        API-->>Client: Список пользователей
        Client-->>Admin: Отображение списка пользователей
    end
```
## Особенности управления пользователями
1. **Иерархия ролей**:
    - Суперадминистратор (полный доступ ко всем функциям)
    - Администратор (управление пользователями и настройками)
    - Модератор (управление игровыми раундами)
    - Пользователь (базовый доступ к системе)
    - Гость (ограниченный доступ только для просмотра)

2. **Аудит действий**:
    - Все действия по управлению пользователями логируются
    - История изменений ролей и статусов пользователей
    - Запись информации о том, кто и когда внес изменения

3. **Массовые операции**:
    - Импорт пользователей из CSV/Excel
    - Массовое назначение ролей
    - Массовая рассылка уведомлений

4. **Самообслуживание пользователей**:
    - Изменение собственного профиля
    - Сброс пароля
    - Настройка двухфакторной аутентификации
