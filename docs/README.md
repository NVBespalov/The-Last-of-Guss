# Документация проекта системы подсчета очков

## Обзор

Этот раздел содержит полную документацию по проекту системы подсчета очков для игры. Система позволяет регистрировать действия игроков (тапы), управлять игровыми раундами и вести учет очков, с учетом различных бизнес-правил и ограничений.

## Основные возможности

- Регистрация пользователей с различными ролями
- Запуск и завершение игровых раундов
- Начисление очков игрокам за тапы
- Игнорирование определенных пользователей при подсчете очков
- Поддержка работы на нескольких серверах с единой базой данных
- Доступ к статистике и истории игр

## Навигация по документации

### Введение
- [CHANGELOG.md – История изменений](CHANGELOG.md)
- [00-tz.md – Техническое задание](00-tz.md)
- [sdlc.md – Жизненный цикл разработки (SDLC)](sdlc.md)

### Архитектурные схемы (C4)
- [01-context.md – Контекстная диаграмма](architecture/01-context.md)
- [02-container.md – Диаграмма контейнеров](architecture/02-container.md)
- [03-components-backend.md – Диаграмма компонентов (Backend)](architecture/03-components-backend.md)
- [04-frontend-deployment-diagram.md – Развёртывание Frontend](architecture/04-frontend-deployment-diagram.md)
- [05-backend-deployment-diagram.md – Развёртывание Backend](architecture/05-backend-deployment-diagram.md)
- [06-security-architecture.md – Архитектура безопасности](architecture/06-security-architecture.md)

### Диаграммы
#### Компонентные
- [db-er-diagram.md – ER-диаграмма БД](diagrams/db-er-diagram.md)
- [component-diagram.md – Компонентная диаграмма (Общая)](diagrams/component-diagram.md)
- [component-diagram-multiserver.md – Компонентная диаграмма: Мультисерверная архитектура](diagrams/component-diagram-multiserver.md)
- [component-diagram-business.md – Компонентная диаграмма: Модули бизнес-логики](diagrams/component-diagram-business.md)
- [component-diagram-integrations.md – Компонентная диаграмма: Внешние интеграции](diagrams/component-diagram-integrations.md)
- [component-diagram-api.md – Компонентная диаграмма: API](diagrams/component-diagram-api.md)

#### Диаграммы последовательностей (Sequence)
- [index.md – Содержание sequence-диаграмм](diagrams/sequence/index.md)
- [7.1. Тап – начисление очков игроку](diagrams/sequence/sequence-7.1-tap.md)
- [7.2. Игнорирование начисления очков](diagrams/sequence/sequence-7.2-ignore-user.md)
- [7.3. Старт и завершение раунда](diagrams/sequence/sequence-7.3-start-end-round.md)
- [7.4. Настройка игнорируемых пользователей](diagrams/sequence/sequence-7.4-edit-ignored-users.md)
- [7.5. Запрет тапов вне активного раунда](diagrams/sequence/sequence-7.5-tap-outside-active.md)
- [7.6. Масштабируемость и консистентность](diagrams/sequence/sequence-7.6-scalability.md)
- [7.7. Доступ к статистике и истории](diagrams/sequence/sequence-7.7-stats-history.md)
- [7.8. Авторизация и аутентификация](diagrams/sequence/sequence-7.8-auth.md)
- [7.9. Управление пользователями](diagrams/sequence/sequence-7.9-user-management.md)

### Тестирование
- [index.md – Индекс документации по тестированию](testing/README.md)
- [testing-strategy.md – Стратегия тестирования](testing/testing-strategy.md)
- [test-types.md – Виды тестов](testing/test-types.md)
- [testing-tools.md – Инструменты для тестирования](testing/testing-tools.md)
- [test-plan.md – План тестирования](testing/test-plan.md)

### Требования к решению (SRS)
- [00-intro.md – Введение в требования](srs/00-intro.md)
- [01-users-and-roles.md – Модель пользователей и их ролей](srs/01-users-and-roles.md)
- [02-entities.md – Описание сущностей](srs/02-entities.md)
- [03-rounds-and-cooldown.md – Правила раундов и cooldown](srs/03-rounds-and-cooldown.md)
- [04-score-calculation.md – Бизнес-логика расчёта очков](srs/04-score-calculation.md)
- [05-exceptions.md – Исключительные ситуации](srs/05-exceptions.md)
- [06-multiservers-and-db.md – Мультисерверы и единая БД](srs/06-multiservers-and-db.md)
- [07-user-stories.md – User Stories и Acceptance Criteria](srs/07-user-stories.md)
- [08-non-functional-requirements.md – Нефункциональные требования](srs/08-non-functional-requirements.md)
- [09-constraints.md – Технологические ограничения](srs/09-constraints.md)
- [10-mvp-and-priorities.md – MVP и приоритеты](srs/10-mvp-and-priorities.md)
- [11-system-design.md – Проектирование (System Design)](srs/11-system-design.md)
- [12-security-requirements.md – Требования безопасности](srs/12-security-requirements.md)

### Стандарты кодирования
- [code-style-guide.md – Руководство по стилю кода](guides/code-style-guide.md)
  - Общие стандарты форматирования
  - Правила для фронтенд-разработки (React, Redux, MUI)
  - Правила для бэкенд-разработки (NestJS, PostgreSQL, TypeORM)
  - Структура проекта по методологии FSD
  - Инструменты для поддержания стиля кода

### API и интеграции
- [api-overview.md – Обзор API](api/api-overview.md)
- [api-auth.md – Аутентификация в API](api/api-auth.md)
- [api-endpoints.md – Конечные точки API](api/api-endpoints.md)
- [api-webhooks.md – Webhooks](api/api-webhooks.md)
- [third-party-integrations.md – Интеграции со сторонними сервисами](api/third-party-integrations.md)

### Руководства и инструкции
- [installation-guide.md – Руководство по установке](guides/installation-guide.md)
- [admin-guide.md – Руководство администратора](guides/admin-guide.md)
- [user-guide.md – Руководство пользователя](guides/user-guide.md)
- [dev-setup.md – Настройка среды разработки](guides/dev-setup.md)
- [testing-guide.md – Руководство по тестированию](guides/testing-guide.md)
- [deployment-guide.md – Руководство по развертыванию](guides/deployment-guide.md)

## Для разработчиков

Для эффективной работы с проектом, пожалуйста, ознакомьтесь с:
- Техническим заданием
- Требованиями к решению (SRS)
- Архитектурными схемами
- Руководством по настройке среды разработки
- Руководством по стилю кода

## Актуальность документации

Последнее обновление документации: 2025-06-18  
Текущая версия: 1.1.0

Для получения информации о последних изменениях см. [CHANGELOG.md](CHANGELOG.md).