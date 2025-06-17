# Руководство по тестированию

## Содержание
- [Введение](#введение)
- [Структура тестов](#структура-тестов)
- [Настройка окружения](#настройка-окружения)
- [Типы тестов](#типы-тестов)
  - [Модульные тесты](#модульные-тесты)
  - [Интеграционные тесты](#интеграционные-тесты)
  - [E2E тесты](#e2e-тесты)
  - [Тестирование WebSockets](#тестирование-websockets)
  - [Тестирование базы данных](#тестирование-базы-данных)
- [Инструменты тестирования](#инструменты-тестирования)
- [Запуск тестов](#запуск-тестов)
- [Непрерывная интеграция](#непрерывная-интеграция)
- [Рекомендации и лучшие практики](#рекомендации-и-лучшие-практики)

## Введение

Тестирование является важной частью процесса разработки проекта "The Last of Guss". Данное руководство описывает подходы к тестированию различных компонентов проекта, инструменты и методики, которые мы используем для обеспечения качества кода.

## Структура тестов

Тесты в нашем монорепозитории организованы следующим образом:
```
The-Last-of-Guss/ ├── frontend/ │ ├── src/ │ └── tests/ │ ├── unit/ # Модульные тесты фронтенда │ ├── integration/# Интеграционные тесты фронтенда │ └── e2e/ # E2E тесты пользовательского интерфейса ├── backend/ │ ├── src/ │ └── tests/ │ ├── unit/ # Модульные тесты бэкенда │ ├── integration/# Интеграционные тесты бэкенда │ ├── api/ # Тесты API │ └── websocket/ # Тесты WebSocket соединений └── tests/ └── e2e/ # Общие E2E тесты всего приложения
``` 

## Настройка окружения

### Требования
- Node.js (версия 16.x или выше)
- npm (версия 8.x или выше)
- PostgreSQL (тестовая база данных)
- Docker (опционально, для изолированных тестов)

### Установка зависимостей для тестирования

Для фронтенда:
```
bash cd frontend npm install --save-dev jest @testing-library/react @testing-library/jest-dom
``` 

Для бэкенда:
```
bash cd backend npm install --save-dev jest supertest
``` 

### Настройка тестовой базы данных

1. Создайте отдельную базу данных для тестирования:
```
sql CREATE DATABASE the_last_of_guss_test;
``` 

2. Настройте переменные окружения для тестов:
```
# Файл backend/.env.test
POSTGRES_HOST=localhost POSTGRES_PORT=5432 POSTGRES_USER=postgres POSTGRES_PASSWORD=your_password POSTGRES_DB=the_last_of_guss_test
``` 

## Типы тестов

### Модульные тесты

Модульные тесты проверяют отдельные компоненты и функции изолированно.

#### Пример модульного теста для фронтенда:
```
javascript // frontend/tests/unit/components/Button.test.js import { render, fireEvent } from '@testing-library/react'; import Button from '../../../src/components/Button';
describe('Button Component', () => { test('вызывает функцию onClick при нажатии', () => { const handleClick = jest.fn(); const { getByText } = render( Нажми меня);
fireEvent.click(getByText('Нажми меня'));

expect(handleClick).toHaveBeenCalledTimes(1);
}); });
button
button
``` 

#### Пример модульного теста для бэкенда:
```
javascript // backend/tests/unit/services/userService.test.js const userService = require('../../../src/services/userService'); const db = require('../../../src/models');
// Мокаем модель базы данных jest.mock('../../../src/models', () => ({ User: { findByPk: jest.fn(), create: jest.fn() } }));
describe('User Service', () => { test('getUserById возвращает пользователя по ID', async () => { const mockUser = { id: 1, username: 'testuser' }; db.User.findByPk.mockResolvedValue(mockUser);
const result = await userService.getUserById(1);

expect(result).toEqual(mockUser);
expect(db.User.findByPk).toHaveBeenCalledWith(1);
}); });
``` 

### Интеграционные тесты

Интеграционные тесты проверяют взаимодействие между различными компонентами системы.

#### Пример интеграционного теста для фронтенда:
```
javascript // frontend/tests/integration/features/login.test.js import { render, fireEvent, waitFor } from '@testing-library/react'; import { Provider } from 'react-redux'; import configureStore from '../../src/store'; import LoginPage from '../../src/pages/LoginPage';
describe('Login Feature', () => { test('отправляет учетные данные и перенаправляет пользователя при успешном входе', async () => { const store = configureStore(); const { getByLabelText, getByRole } = render(     );
fireEvent.change(getByLabelText('Имя пользователя'), { target: { value: 'testuser' } });
fireEvent.change(getByLabelText('Пароль'), { target: { value: 'password123' } });

fireEvent.click(getByRole('button', { name: /войти/i }));

await waitFor(() => {
expect(store.getState().auth.isAuthenticated).toBe(true);
});
}); });
provider
loginpage
provider
``` 

#### Пример интеграционного теста для бэкенда:
```
javascript // backend/tests/integration/routes/users.test.js const request = require('supertest'); const app = require('../../../src/app'); const db = require('../../../src/models');
describe('User API Routes', () => { beforeAll(async () => { // Настраиваем тестовую базу данных await db.sequelize.sync({ force: true }); });
afterAll(async () => { // Закрываем соединение с базой данных await db.sequelize.close(); });
test('GET /api/users/:id возвращает пользователя', async () => { // Создаем тестового пользователя const user = await db.User.create({ username: 'testuser', email: 'test@example.com', password: 'password123' });
const response = await request(app)
.get(`/api/users/${user.id}`)
.set('Accept', 'application/json');

expect(response.status).toBe(200);
expect(response.body).toHaveProperty('username', 'testuser');
}); });
``` 

### E2E тесты

E2E (End-to-End) тесты проверяют весь поток работы приложения от начала до конца.

#### Пример E2E теста с использованием Cypress:
```
javascript // tests/e2e/login.spec.js describe('Процесс входа', () => { beforeEach(() => { cy.visit('/login'); });
it('должен разрешить пользователю войти и перенаправить на панель управления', () => { cy.get('input[name=username]').type('testuser'); cy.get('input[name=password]').type('password123'); cy.get('button[type=submit]').click();
// Проверяем, что после успешного входа мы перенаправлены на dashboard
cy.url().should('include', '/dashboard');
cy.get('h1').should('contain', 'Dashboard');
});
it('должен показать сообщение об ошибке при неверных учетных данных', () => { cy.get('input[name=username]').type('wronguser'); cy.get('input[name=password]').type('wrongpassword'); cy.get('button[type=submit]').click();
cy.get('.error-message').should('be.visible');
cy.get('.error-message').should('contain', 'Неверное имя пользователя или пароль');
}); });
``` 

### Тестирование WebSockets

#### Пример теста WebSocket соединения:
```
javascript // backend/tests/websocket/connection.test.js const WebSocket = require('ws'); const http = require('http'); const { setupWebSocketServer } = require('../../src/websocket');
describe('WebSocket Server', () => { let server; let wsServer; let clientSocket;
beforeAll((done) => { server = http.createServer(); wsServer = setupWebSocketServer(server); server.listen(8080, () => { done(); }); });
afterAll((done) => { if (clientSocket && clientSocket.readyState === WebSocket.OPEN) { clientSocket.close(); } server.close(() => { done(); }); });
test('должен установить соединение с клиентом', (done) => { clientSocket = new WebSocket('ws://localhost:8080');
clientSocket.on('open', () => {
expect(clientSocket.readyState).toBe(WebSocket.OPEN);
done();
});
});
test('должен получать и отправлять сообщения', (done) => { clientSocket = new WebSocket('ws://localhost:8080');
clientSocket.on('open', () => {
clientSocket.send(JSON.stringify({ type: 'message', content: 'Hello Server' }));
});

clientSocket.on('message', (data) => {
const message = JSON.parse(data);
expect(message).toHaveProperty('type');
expect(message).toHaveProperty('content');
done();
});
}); });
``` 

### Тестирование базы данных

#### Пример теста взаимодействия с базой данных:
```
javascript // backend/tests/integration/database/user.test.js const db = require('../../../src/models');
describe('User Model', () => { beforeAll(async () => { // Настраиваем тестовую базу данных await db.sequelize.sync({ force: true }); });
afterAll(async () => { // Закрываем соединение с базой данных await db.sequelize.close(); });
test('создание пользователя', async () => { const userData = { username: 'testuser', email: 'test@example.com', password: 'password123' };
const user = await db.User.create(userData);

expect(user).toHaveProperty('id');
expect(user.username).toBe(userData.username);
expect(user.email).toBe(userData.email);
});
test('получение пользователя', async () => { // Создаем пользователя для теста const createdUser = await db.User.create({ username: 'getuser', email: 'get@example.com', password: 'password123' });
// Получаем пользователя из базы данных
const foundUser = await db.User.findByPk(createdUser.id);

expect(foundUser).not.toBeNull();
expect(foundUser.username).toBe('getuser');
}); });
``` 

## Инструменты тестирования

В нашем проекте используются следующие инструменты для тестирования:

### Фронтенд
- **Jest**: фреймворк для модульного тестирования
- **React Testing Library**: библиотека для тестирования React-компонентов
- **Mock Service Worker (MSW)**: для мокирования API-запросов

### Бэкенд
- **Jest**: фреймворк для модульного тестирования
- **Supertest**: библиотека для тестирования HTTP-запросов
- **ws**: для тестирования WebSocket соединений

### E2E
- **Cypress**: фреймворк для E2E тестирования
- **Puppeteer**: для программного управления браузером (опционально)

## Запуск тестов

### Запуск модульных тестов фронтенда:
```bash
cd frontend
npm test
```
```
### Запуск модульных тестов бэкенда:
``` bash
cd backend
npm test
```
### Запуск интеграционных тестов:
``` bash
# Фронтенд
cd frontend
npm run test:integration

# Бэкенд
cd backend
npm run test:integration
```
### Запуск E2E тестов:
``` bash
npm run test:e2e
```
### Запуск всех тестов:
``` bash
npm run test:all
```
## Непрерывная интеграция
Мы используем GitHub Actions для автоматического запуска тестов при каждом пуше в репозиторий. Конфигурация находится в файле `.github/workflows/tests.yml`.
Базовый процесс CI/CD включает:
1. Сборку проекта
2. Запуск модульных тестов
3. Запуск интеграционных тестов
4. Запуск E2E тестов при пуше в основные ветки (main, develop)

## Рекомендации и лучшие практики
### Общие рекомендации
- Пишите тесты до или одновременно с написанием кода (TDD/BDD)
- Стремитесь к высокому покрытию кода тестами (минимум 80%)
- Используйте моки и стабы для изоляции тестируемого кода
- Тесты должны быть независимыми друг от друга

### Для модульных тестов
- Тестируйте только публичное API компонента/модуля
- Один тест должен проверять одну функциональность
- Используйте описательные имена для тестов

### Для интеграционных тестов
- Создавайте и уничтожайте тестовые данные в рамках каждого теста
- Используйте транзакции для изоляции тестов, работающих с базой данных
- Тестируйте граничные случаи и обработку ошибок

### Для E2E тестов
- Тестируйте только критические пользовательские сценарии
- Используйте стабильные селекторы (data-testid)
- Минимизируйте количество E2E тестов, так как они медленные и хрупкие

### Для тестов WebSocket
- Проверяйте установку соединения
- Тестируйте обработку сообщений
- Проверяйте обработку разрыва соединения
- Тестируйте сценарии повторного подключения

### Для тестов базы данных
- Используйте отдельную тестовую базу данных
- Очищайте данные после каждого теста
- Тестируйте валидацию данных
- Проверяйте ограничения целостности данных
