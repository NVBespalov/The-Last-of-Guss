# Инструменты для тестирования
## Содержание
1. [Фреймворки для модульного тестирования](#фреймворки-для-модульного-тестирования)
2. [Инструменты для интеграционного тестирования](#инструменты-для-интеграционного-тестирования)
3. [Инструменты для E2E тестирования](#инструменты-для-e2e-тестирования)
4. [Инструменты для нагрузочного тестирования](#инструменты-для-нагрузочного-тестирования)
5. [Инструменты для тестирования безопасности](#инструменты-для-тестирования-безопасности)
6. [Инструменты анализа покрытия](#инструменты-анализа-покрытия)
7. [Инструменты CI/CD](#инструменты-cicd)
8. [Инструменты для мокирования](#инструменты-для-мокирования)
9. [Управление тестированием](#управление-тестированием)

## Фреймворки для модульного тестирования
### Jest
**Описание**: Основной фреймворк для модульного тестирования JavaScript/TypeScript кода.
**Характеристики**:
- Встроенная поддержка мокирования
- Снапшот-тестирование
- Асинхронное тестирование
- Параллельное выполнение тестов
- Отчеты о покрытии кода

**Установка и настройка**:
``` bash
npm install --save-dev jest @types/jest ts-jest
```
**Конфигурация** (`jest.config.js`):
``` javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```
### Mocha + Chai
**Описание**: Альтернативный стек для тестирования, который используется в некоторых компонентах.
**Характеристики**:
- Гибкая структура тестов
- Поддержка различных библиотек утверждений
- Поддержка асинхронных тестов

**Установка**:
``` bash
npm install --save-dev mocha chai @types/mocha @types/chai
```
## Инструменты для интеграционного тестирования
### Supertest
**Описание**: Библиотека для тестирования HTTP-серверов и API.
**Характеристики**:
- Удобный API для HTTP-запросов
- Интеграция с Jest и Mocha
- Проверка статусов, заголовков и тела ответа

**Пример использования**:
``` javascript
const request = require('supertest');
const app = require('../app');

describe('API Tests', () => {
  it('GET /api/users should return users list', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token123')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('users');
    expect(response.body.users.length).toBeGreaterThan(0);
  });
});
```
### TypeORM Testing Tools
**Описание**: Инструменты для тестирования взаимодействия с базой данных через TypeORM.
**Характеристики**:
- Настройка тестовых баз данных
- Транзакции для изоляции тестов
- Очистка данных после тестов

**Пример настройки**:
``` typescript
import { createConnection, getConnection } from 'typeorm';
import { User, Round, Tap } from '../entities';

beforeAll(async () => {
  await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [User, Round, Tap],
    synchronize: true,
    logging: false
  });
});

afterAll(async () => {
  const connection = getConnection();
  await connection.close();
});
```
## Инструменты для E2E тестирования
### Cypress
**Описание**: Современный фреймворк для E2E тестирования веб-приложений.
**Характеристики**:
- Автоматическое ожидание элементов
- Встроенная отладка и скриншоты
- Запись видео тестов
- Мокирование API-запросов
- Отличная документация

**Установка**:
``` bash
npm install --save-dev cypress
```
**Структура тестов**:
``` 
cypress/
├── fixtures/       # Тестовые данные
├── integration/    # Тесты
├── plugins/        # Плагины
└── support/        # Вспомогательные функции
```
### Playwright
**Описание**: Инструмент для E2E тестирования от Microsoft с поддержкой всех современных браузеров.
**Характеристики**:
- Поддержка Chromium, Firefox, WebKit
- Параллельное тестирование
- Мобильная эмуляция
- Хорошая производительность
- Генерация скриншотов и PDF

**Установка**:
``` bash
npm install --save-dev @playwright/test
```
**Базовый тест**:
``` typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://example.com/');
  
  // Клик по кнопке
  await page.click('[data-test="start-round-button"]');
  
  // Заполнение формы
  await page.fill('input[name="duration"]', '5');
  await page.click('[data-test="confirm-button"]');
  
  // Проверка результата
  await expect(page.locator('[data-test="round-status"]')).toContainText('Active');
});
```
## Инструменты для нагрузочного тестирования
### k6
**Описание**: Современный инструмент для нагрузочного тестирования.
**Характеристики**:
- JavaScript API
- Различные сценарии нагрузки
- Метрики производительности
- Интеграция с CI/CD
- Низкое потребление ресурсов

**Установка**:
``` bash
# MacOS
brew install k6

# Windows
choco install k6

# Docker
docker pull grafana/k6
```
### JMeter
**Описание**: Классический инструмент для нагрузочного тестирования от Apache.
**Характеристики**:
- Графический интерфейс
- Поддержка различных протоколов
- Распределенное тестирование
- Подробные отчеты

## Инструменты для тестирования безопасности
### OWASP ZAP
**Описание**: Прокси для тестирования безопасности веб-приложений.
**Характеристики**:
- Автоматическое сканирование уязвимостей
- Перехват и модификация трафика
- Поиск XSS, SQL-инъекций и других уязвимостей
- Интеграция с CI/CD

### SonarQube
**Описание**: Платформа для анализа качества кода и безопасности.
**Характеристики**:
- Статический анализ кода
- Обнаружение уязвимостей
- Отслеживание покрытия кода
- Анализ сложности кода

**Интеграция с проектом**:
``` bash
# Запуск сканирования
npm run sonar-scanner
```
## Инструменты анализа покрытия
### Istanbul/nyc
**Описание**: Инструмент для анализа покрытия кода тестами.
**Характеристики**:
- Интеграция с Jest
- Детальные отчеты о покрытии
- Настраиваемые пороги покрытия

**Установка**:
``` bash
npm install --save-dev nyc
```
**Использование**:
``` bash
nyc npm test
```
### Codecov
**Описание**: Сервис для отслеживания покрытия кода тестами в CI/CD.
**Характеристики**:
- Интеграция с GitHub
- Визуализация покрытия
- Сравнение покрытия между ветками
- Настройка порогов для PR

**Интеграция** (`.github/workflows/test.yml`):
``` yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v2
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
```
## Инструменты CI/CD
### GitHub Actions
**Описание**: Интеграция тестирования в CI/CD пайплайн на GitHub.
**Конфигурация** (`.github/workflows/test.yml`):
``` yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run tests
        run: npm test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
```
### Jenkins
**Описание**: Сервер CI/CD для автоматизации тестирования.
**Основные этапы**:
1. Сборка проекта
2. Статический анализ кода
3. Модульные тесты
4. Интеграционные тесты
5. E2E тесты (для основных веток)
6. Отчеты о покрытии

## Инструменты для мокирования
### MSW (Mock Service Worker)
**Описание**: Инструмент для перехвата и мокирования сетевых запросов.
**Характеристики**:
- Мокирование REST и GraphQL API
- Работа в браузере и Node.js
- Реалистичное тестирование

**Установка**:
``` bash
npm install --save-dev msw
```
**Пример**:
``` javascript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```
### Sinon.JS
**Описание**: Библиотека для создания шпионов, заглушек и моков в JavaScript.
**Характеристики**:
- Шпионы для отслеживания вызовов функций
- Стабы для контроля поведения функций
- Моки для имитации объектов
- Поддержка таймеров

**Установка**:
``` bash
npm install --save-dev sinon
```
## Управление тестированием
### JIRA + Xray
**Описание**: Платформа для управления тестированием и отслеживания дефектов.
**Характеристики**:
- Управление тест-кейсами
- Планирование тестирования
- Отчеты о тестировании
- Трекинг дефектов

### Allure
**Описание**: Инструмент для создания отчетов о тестировании.
**Характеристики**:
- Наглядные отчеты
- История прогона тестов
- Интеграция с CI/CD
- Поддержка различных фреймворков

**Установка**:
``` bash
npm install --save-dev allure-commandline @wdio/allure-reporter
```