# Виды тестов
## Содержание
1. [Модульные (Unit) тесты](#%D0%BC%D0%BE%D0%B4%D1%83%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-unit-%D1%82%D0%B5%D1%81%D1%82%D1%8B)
2. [Интеграционные тесты](#%D0%B8%D0%BD%D1%82%D0%B5%D0%B3%D1%80%D0%B0%D1%86%D0%B8%D0%BE%D0%BD%D0%BD%D1%8B%D0%B5-%D1%82%D0%B5%D1%81%D1%82%D1%8B)
3. [End-to-End тесты](#end-to-end-%D1%82%D0%B5%D1%81%D1%82%D1%8B)
4. [Тесты безопасности](#%D1%82%D0%B5%D1%81%D1%82%D1%8B-%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8)
5. [Нагрузочные тесты](#%D0%BD%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BE%D1%87%D0%BD%D1%8B%D0%B5-%D1%82%D0%B5%D1%81%D1%82%D1%8B)
6. [Тесты API](#%D1%82%D0%B5%D1%81%D1%82%D1%8B-api)
7. [Тесты пользовательского интерфейса](#%D1%82%D0%B5%D1%81%D1%82%D1%8B-%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D0%BA%D0%BE%D0%B3%D0%BE-%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D0%B0)

## Модульные (Unit) тесты
### Описание
Модульные тесты проверяют отдельные компоненты системы в изоляции, обеспечивая их корректную работу.
### Характеристики
- **Фреймворк**: Jest
- **Покрытие**: Не менее 80% кода
- **Ответственные**: Разработчики
- **Запуск**: При каждом коммите, локально и в CI

### Принципы написания
- Каждый тест должен быть изолирован и не зависеть от других тестов
- Мокирование внешних зависимостей
- Проверка всех граничных условий и исключительных ситуаций
- Один тест - одна функциональность

### Пример
``` javascript
// Пример unit-теста для функции расчета очков
describe('ScoreCalculator', () => {
  it('should calculate points correctly for regular tap', () => {
    const calculator = new ScoreCalculator();
    const points = calculator.calculatePoints({
      userId: 1,
      tapType: 'regular',
      timestamp: new Date()
    });
    expect(points).toBe(10);
  });

  it('should not award points for ignored users', () => {
    const calculator = new ScoreCalculator({ ignoredUsers: [2] });
    const points = calculator.calculatePoints({
      userId: 2,
      tapType: 'regular',
      timestamp: new Date()
    });
    expect(points).toBe(0);
  });
});
```
## Интеграционные тесты
### Описание
Интеграционные тесты проверяют взаимодействие между компонентами системы, обеспечивая их корректную совместную работу.
### Характеристики
- **Фреймворк**: Supertest для API, Jest для бизнес-логики
- **Покрытие**: Все ключевые интеграции
- **Ответственные**: Разработчики и QA-инженеры
- **Запуск**: При PR и ночных сборках

### Области тестирования
- Взаимодействие с базой данных
- API-интеграции
- Внешние сервисы и интеграции
- Взаимодействие между модулями системы

### Пример
``` javascript
// Пример интеграционного теста для API
describe('Round API', () => {
  let app;
  let db;

  beforeAll(async () => {
    db = await createTestDatabase();
    app = createApp({ database: db });
  });

  afterAll(async () => {
    await db.close();
  });

  it('should start a new round', async () => {
    const response = await request(app)
      .post('/api/rounds')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ duration: 300 });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('active');
  });
});
```
## End-to-End тесты
### Описание
E2E тесты проверяют работу всей системы целиком с точки зрения конечного пользователя.
### Характеристики
- **Инструменты**: Cypress, Playwright
- **Покрытие**: Все критические бизнес-сценарии
- **Ответственные**: QA-инженеры
- **Запуск**: Перед релизом, на стейдж-среде

### Ключевые сценарии
1. Регистрация и авторизация пользователей
2. Старт и завершение игрового раунда
3. Начисление очков игрокам за тапы
4. Игнорирование определенных пользователей
5. Просмотр статистики и истории игр

### Пример
``` javascript
// Пример E2E теста в Cypress
describe('Game Round', () => {
  beforeEach(() => {
    cy.login('admin', 'password');
    cy.visit('/admin/rounds');
  });

  it('should successfully start and end a round', () => {
    // Запуск раунда
    cy.get('[data-test="start-round-button"]').click();
    cy.get('[data-test="confirm-dialog"]').within(() => {
      cy.get('input[name="duration"]').type('5');
      cy.get('[data-test="confirm-button"]').click();
    });
    
    // Проверка статуса раунда
    cy.get('[data-test="round-status"]').should('contain', 'Active');
    
    // Имитация тапов
    cy.get('[data-test="simulate-taps"]').click();
    
    // Завершение раунда
    cy.get('[data-test="end-round-button"]').click();
    cy.get('[data-test="confirm-dialog"] [data-test="confirm-button"]').click();
    
    // Проверка статистики
    cy.get('[data-test="round-status"]').should('contain', 'Completed');
    cy.get('[data-test="scoreboard"]').should('be.visible');
  });
});
```
## Тесты безопасности
### Описание
Тесты безопасности проверяют систему на уязвимости и обеспечивают защиту данных и доступа.
### Характеристики
- **Инструменты**: OWASP ZAP, SonarQube
- **Периодичность**: Ежемесячно и перед релизами
- **Ответственные**: Специалисты по безопасности

### Виды проверок
- Тестирование на проникновение
- Статический анализ кода
- Проверка управления доступом
- Проверка аутентификации и авторизации
- Защита от SQL-инъекций и XSS

## Нагрузочные тесты
### Описание
Нагрузочные тесты проверяют производительность и масштабируемость системы под нагрузкой.
### Характеристики
- **Инструменты**: JMeter, k6
- **Периодичность**: Перед каждым мажорным релизом
- **Ответственные**: DevOps и QA-инженеры

### Сценарии тестирования
- Тестирование пропускной способности API
- Симуляция одновременных пользователей
- Проверка работы при пиковых нагрузках
- Долговременное тестирование стабильности

### Пример конфигурации k6
``` javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Разгон до 100 пользователей
    { duration: '3m', target: 100 }, // Удержание нагрузки
    { duration: '1m', target: 0 },   // Снижение до 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% запросов должны быть менее 200ms
    http_req_failed: ['rate<0.01'],   // Менее 1% ошибок
  },
};

export default function() {
  const BASE_URL = 'https://api.example.com';
  
  // Симуляция тапа
  const tapResponse = http.post(`${BASE_URL}/api/taps`, {
    userId: Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString()
  });
  
  check(tapResponse, {
    'tap is successful': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 200,
  });
  
  // Получение статистики
  const statsResponse = http.get(`${BASE_URL}/api/stats`);
  
  check(statsResponse, {
    'stats retrieved': (r) => r.status === 200,
  });
  
  sleep(1);
}
```
## Тесты API
### Описание
Тесты API проверяют корректность работы всех API-эндпоинтов системы.
### Характеристики
- **Инструменты**: Supertest, Postman
- **Покрытие**: 100% API-эндпоинтов
- **Ответственные**: Разработчики и QA-инженеры

### Проверки
- Валидация запросов и ответов
- Проверка кодов состояния HTTP
- Аутентификация и авторизация
- Обработка ошибок
- Соответствие спецификации API

## Тесты пользовательского интерфейса
### Описание
UI-тесты проверяют корректность работы пользовательского интерфейса.
### Характеристики
- **Инструменты**: React Testing Library, Cypress
- **Покрытие**: Ключевые UI-компоненты и сценарии
- **Ответственные**: Фронтенд-разработчики и QA-инженеры

### Проверки
- Рендеринг компонентов
- Обработка пользовательских взаимодействий
- Доступность (a11y)
- Адаптивный дизайн
- Работа в разных браузерах
