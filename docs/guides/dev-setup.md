# Настройка среды разработки

## Содержание

- [Требования](#требования)
- [Структура проекта](#структура-проекта)
- [Установка Node.js и npm](#установка-nodejs-и-npm)
- [Установка и настройка PostgreSQL](#установка-и-настройка-postgresql)
- [Клонирование репозитория](#клонирование-репозитория)
- [Установка зависимостей](#установка-зависимостей)
- [Настройка IDE](#настройка-ide)
- [Настройка переменных окружения](#настройка-переменных-окружения)
- [Запуск проекта в режиме разработки](#запуск-проекта-в-режиме-разработки)
- [Работа с WebSockets](#работа-с-websockets)
- [Сборка проекта](#сборка-проекта)
- [Дополнительные инструменты](#дополнительные-инструменты)

## Требования

- Node.js (версия 16.x или выше)
- npm (версия 8.x или выше)
- PostgreSQL (версия 14.x или выше)
- Git

## Структура проекта

Проект организован как монорепозиторий со следующей структурой:

```
The-Last-of-Guss/ ├── frontend/ # Фронтенд часть проекта ├── backend/ # Бэкенд часть проекта └── ... # Общие файлы и конфигурации
``` 

## Установка Node.js и npm

### Windows

1. Перейдите на [официальный сайт Node.js](https://nodejs.org/)
2. Скачайте и установите LTS версию Node.js
3. Проверьте установку, выполнив в командной строке:

```
node -v
npm -v
```

### macOS

1. Установите Homebrew, если он еще не установлен:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Установите Node.js с помощью Homebrew:

```
brew install node
```

3. Проверьте установку:

```
node -v
npm -v
```

### Linux

1. Используйте менеджер пакетов вашего дистрибутива:

```
# Для Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Для Fedora
sudo dnf install nodejs npm
```

2. Проверьте установку:

```
node -v
npm -v
```

## Установка и настройка PostgreSQL

### Windows

1. Скачайте установщик PostgreSQL с [официального сайта](https://www.postgresql.org/download/windows/)
2. Запустите установщик и следуйте инструкциям
3. Запомните пароль для пользователя postgres
4. После установки проверьте соединение с PostgreSQL:

```
psql -U postgres
```

### macOS

1. Установите PostgreSQL с помощью Homebrew:

```
brew install postgresql
```

2. Запустите сервер PostgreSQL:

```
brew services start postgresql
```

3. Создайте базу данных:

```
createdb the_last_of_guss
```

### Linux

1. Установите PostgreSQL:

```
# Для Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Для Fedora
sudo dnf install postgresql-server
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

2. Настройте пользователя и базу данных:

```
sudo -u postgres psql
CREATE DATABASE the_last_of_guss;
CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE the_last_of_guss TO myuser;
\q
```

### Создание базы данных для проекта

1. Подключитесь к PostgreSQL:

```
psql -U postgres
```

2. Создайте базу данных для проекта:

```sql
   CREATE
DATABASE the_last_of_guss;
```

3. Выйдите из psql:

```
   \q
```

## Клонирование репозитория

1. Клонируйте монорепозиторий:

```
   git clone https://github.com/NVBespalov/The-Last-of-Guss.git
   cd The-Last-of-Guss
```

## Установка зависимостей

### Установка зависимостей для всего проекта

Если в корне проекта есть общий package.json для управления всеми зависимостями:

```
npm install
``` 

### Установка зависимостей для фронтенда

```
cd frontend npm install
``` 

### Установка зависимостей для бэкенда

```
cd backend npm install
``` 

## Настройка IDE

### WebStorm

1. Откройте WebStorm
2. Выберите "Open" и укажите корневую директорию проекта (`The-Last-of-Guss`)
3. WebStorm автоматически распознает структуру монорепозитория
4. Рекомендуемые плагины:
    - ESLint
    - Prettier
    - GitToolBox
    - PostgreSQL

### VS Code

1. Откройте VS Code
2. Выберите "File > Open Folder" и укажите корневую директорию проекта
3. Рекомендуемые расширения:
    - ESLint
    - Prettier
    - Path Intellisense
    - npm Intellisense
    - PostgreSQL
    - Multi-root Workspaces (для удобной работы с монорепозиторием)

## Настройка переменных окружения

1. Создайте файл `.env` в директории бэкенда:

```
cd backend touch .env
``` 

2. Добавьте в файл `.env` следующие переменные (замените значения на свои):

```
# Настройки сервера
PORT=3000 NODE_ENV=development
# Настройки PostgreSQL
POSTGRES_HOST=localhost POSTGRES_PORT=5432 POSTGRES_USER=postgres POSTGRES_PASSWORD=your_password POSTGRES_DB=the_last_of_guss
# Настройки WebSockets
WS_PORT=8080
``` 

## Запуск проекта в режиме разработки

### Запуск фронтенда

```
cd frontend npm run dev
``` 

### Запуск бэкенда

```
cd backend npm run dev
``` 

### Одновременный запуск (если настроен)

Если в корневом package.json настроены скрипты для одновременного запуска:

```
npm run dev
``` 

## Работа с WebSockets

В проекте используются WebSockets для обеспечения двунаправленной связи между клиентом и сервером в реальном времени.

### Тестирование WebSockets

Для тестирования WebSocket-соединений можно использовать:

1. **Браузерную консоль** - для тестирования на стороне клиента:
   ```javascript
   // Пример соединения
   const socket = new WebSocket('ws://localhost:8080');
   
   // Обработка событий
   socket.onopen = () => console.log('Соединение установлено');
   socket.onmessage = (event) => console.log('Получено сообщение:', event.data);
   socket.onclose = () => console.log('Соединение закрыто');
   
   // Отправка сообщения
   socket.send(JSON.stringify({ type: 'message', content: 'Тестовое сообщение' }));
   ```

2. **Postman** - для тестирования WebSocket API
3. **wscat** - утилита командной строки:
   ```
   npm install -g wscat
   wscat -c ws://localhost:8080
   ```

## Сборка проекта

### Сборка фронтенда

```
cd frontend npm run build
``` 

### Сборка бэкенда

```
cd backend npm run build
``` 

### Полная сборка проекта (если настроена)

Если в корневом package.json настроены скрипты для полной сборки:

```
npm run build
``` 

## Дополнительные инструменты

- **Postman** - для тестирования REST API и WebSocket
- **pgAdmin** - для управления PostgreSQL
- **DBeaver** - универсальный инструмент для работы с базами данных
- **Redux DevTools** - для отладки состояния Redux (если используется)
- **React Developer Tools** - для отладки React-компонентов (если используется)
- **Docker** - для контейнеризации приложения

## Решение проблем

### Распространенные ошибки

1. **ENOENT: no such file or directory**
    - Проверьте правильность пути к файлам и директориям

2. **EADDRINUSE: address already in use**
    - Порт уже используется другим процессом, измените порт в настройках или завершите конфликтующий процесс

3. **Проблемы с подключением к PostgreSQL**
    - Убедитесь, что сервис PostgreSQL запущен
    - Проверьте правильность учетных данных в файле .env
    - Проверьте доступность порта PostgreSQL (обычно 5432)

4. **Проблемы с WebSocket соединением**
    - Убедитесь, что WebSocket сервер запущен
    - Проверьте правильность URL для подключения
    - Проверьте наличие блокировок в брандмауэре для указанного порта

### Поддержка

При возникновении проблем с настройкой среды разработки создавайте issue в репозитории
проекта: [https://github.com/NVBespalov/The-Last-of-Guss/issues](https://github.com/NVBespalov/The-Last-of-Guss/issues)
