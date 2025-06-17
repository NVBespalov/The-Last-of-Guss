# Руководство по стилю кода

## Содержание

- [Общие стандарты форматирования](#общие-стандарты-форматирования)
- [Фронтенд](#фронтенд)
    - [Стандарты форматирования](#стандарты-форматирования-react)
    - [Правила именования](#правила-именования-react)
    - [Структура проекта (FSD)](#структура-проекта-fsd)
- [Бэкенд](#бэкенд)
    - [Стандарты форматирования](#стандарты-форматирования-nestjs)
    - [Правила именования](#правила-именования-nestjs)
    - [Структура проекта](#структура-проекта-nestjs)
- [Инструменты для поддержания стиля кода](#инструменты-для-поддержания-стиля-кода)

## Общие стандарты форматирования

### Отступы и пробелы

- Используйте 2 пробела для отступов
- Не используйте табуляцию для отступов
- Избегайте пробелов в конце строк
- Заканчивайте файлы пустой строкой

### Форматирование кода

- Максимальная длина строки: 100 символов
- Используйте одинарные кавычки (`'`) для строк
- Для составных выражений в одну строку требуются фигурные скобки

### Комментирование кода

- Используйте JSDoc для документирования функций и компонентов
- Пишите комментарии на русском языке
- Комментируйте сложную бизнес-логику, но избегайте избыточных комментариев

## Фронтенд

### Стандарты форматирования (React)

#### Импорты

- Группируйте импорты в следующем порядке:
    1. Сторонние библиотеки (React, Redux, MUI)
    2. Абсолютные импорты (из проекта)
    3. Относительные импорты
    4. Стили

```javascript
// Сторонние библиотеки
import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Button, Typography} from '@mui/material';

// Абсолютные импорты
import {userActions} from '@/entities/user';
import {useGetUsers} from '@/shared/api';

// Относительные импорты
import {UserCard} from '../UserCard';

// Стили
import './styles.css';
```

#### Компоненты

- Используйте функциональные компоненты с хуками
- Деструктурируйте пропсы
- Используйте стрелочные функции для определения компонентов

```javascript
// Хороший пример
const UserProfile = ({username, avatar, onLogout}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="user-profile">
            {/* компонент */}
        </div>
    );
};

// Плохой пример
function UserProfile(props) {
    const username = props.username;
    const avatar = props.avatar;

    return (
        <div className="user-profile">
            {/* компонент */}
        </div>
    );
}
```

#### JSX

- Используйте самозакрывающиеся теги для компонентов без дочерних элементов
- Используйте фигурные скобки для многострочных атрибутов JSX

```javascript
// Хороший пример
<Button
    variant="contained"
    color="primary"
    onClick={handleClick}
    disabled={isLoading}
>
    Сохранить
</Button>

// Плохой пример
<Button variant="contained" color="primary" onClick={handleClick} disabled={isLoading}>Сохранить</Button>
```

### Правила именования (React)

#### Файлы и директории

- Используйте PascalCase для компонентов: `UserCard.tsx`, `ProfilePage.tsx`
- Используйте kebab-case для обычных файлов: `use-auth.ts`, `api-config.ts`
- Используйте индексные файлы для экспорта: `index.ts`

#### Компоненты

- Используйте PascalCase для названий компонентов: `UserProfile`, `LoginForm`
- Добавляйте суффиксы для специализированных компонентов:
    - `*Page` для страниц: `LoginPage`, `ProfilePage`
    - `*Widget` для виджетов: `UserWidget`, `WeatherWidget`
    - `*Feature` для фич: `AuthFeature`, `CommentFeature`

#### Переменные и функции

- Используйте camelCase для переменных и функций: `userName`, `isLoading`
- Используйте префиксы для функций:
    - `handle*` для обработчиков событий: `handleClick`, `handleSubmit`
    - `get*` для функций получения данных: `getUserData`
    - `set*` для функций установки данных: `setUserData`
    - `is*`, `has*`, `should*` для булевых переменных: `isVisible`, `hasError`

#### Redux (хранилище и действия)

- Используйте camelCase для редьюсеров и селекторов: `userReducer`, `getUsers`
- Используйте SNAKE_CASE для констант действий: `FETCH_USERS_REQUEST`, `LOGIN_SUCCESS`

### Структура проекта (FSD)

Проект организован по методологии Feature-Sliced Design (FSD):

```
src/
├── app/                  # Инициализация приложения, глобальные стили, провайдеры
│   ├── providers/        # Провайдеры (Redux, Router, Theme)
│   ├── styles/           # Глобальные стили
│   └── index.tsx         # Точка входа
│
├── pages/                # Страницы приложения
│   ├── LoginPage/
│   ├── ProfilePage/
│   └── ...
│
├── widgets/              # Самостоятельные блоки интерфейса
│   ├── Header/
│   ├── Sidebar/
│   └── ...
│
├── features/             # Интерактивные блоки с бизнес-логикой
│   ├── auth/
│   ├── profile/
│   └── ...
│
├── entities/             # Бизнес-сущности
│   ├── user/
│   ├── product/
│   └── ...
│
├── shared/               # Переиспользуемые модули
│   ├── api/              # Работа с API
│   ├── config/           # Конфигурации
│   ├── lib/              # Утилиты и хелперы
│   ├── ui/               # UI компоненты
│   └── ...
│
└── index.tsx             # Точка входа в приложение
```

#### Особенности организации в FSD

- Каждый слайс (слой) может импортировать только те слайсы, которые находятся ниже по иерархии
- Каждый слайс экспортирует публичное API через индексный файл
- Следуйте правилу "композиции вместо наследования"

## Бэкенд

### Стандарты форматирования (NestJS)

#### Импорты

- Группируйте импорты в следующем порядке:
    1. Встроенные модули Node.js
    2. Модули NestJS
    3. Внешние модули
    4. Внутренние модули

```typescript
// Встроенные модули Node.js
import {join} from 'path';

// Модули NestJS
import {Controller, Get, Post, Body} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';

// Внешние модули
import {Repository} from 'typeorm';

// Внутренние модули
import {User} from './entities/user.entity';
import {CreateUserDto} from './dto/create-user.dto';
```

#### Декораторы

- Размещайте декораторы на отдельных строках
- Сначала размещайте декораторы класса, затем декораторы метода

```typescript
// Хороший пример
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    @Get()
    @UseInterceptors(CacheInterceptor)
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }
}

// Плохой пример
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    @Get() @UseInterceptors(CacheInterceptor)
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }
}
```

#### TypeORM

- Определяйте каждое свойство сущности на отдельной строке
- Используйте декораторы `@Column`, `@Entity`, `@ManyToOne` и т.д.

```typescript

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 100})
    firstName: string;

    @Column({length: 100})
    lastName: string;

    @ManyToOne(() => Role, role => role.users)
    role: Role;
}
```

### Правила именования (NestJS)

#### Файлы и директории

- Используйте kebab-case для файлов: `users.controller.ts`, `auth.service.ts`
- Суффиксы файлов должны отражать их тип: `.controller.ts`, `.service.ts`, `.module.ts`, `.entity.ts`
- Каждый модуль должен быть в отдельной директории

#### Классы

- Используйте PascalCase для названий классов
- Добавляйте суффиксы для типов классов:
    - `*Controller` для контроллеров: `UsersController`
    - `*Service` для сервисов: `AuthService`
    - `*Repository` для репозиториев: `UserRepository`
    - `*Entity` для сущностей: `UserEntity`
    - `*Dto` для DTO: `CreateUserDto`

#### Методы и переменные

- Используйте camelCase для методов и переменных: `findAllUsers`, `getUserById`
- Используйте подробные названия для CRUD-операций:
    - `findAll`, `findOne`, `create`, `update`, `delete`

#### Ендпоинты и роуты

- Используйте существительные во множественном числе для API-ендпоинтов: `/users`, `/articles`
- Используйте вложенные ресурсы для представления иерархии: `/users/:userId/posts`

### Структура проекта (NestJS)

```
src/
├── main.ts              # Точка входа в приложение
├── app.module.ts        # Корневой модуль приложения
│
├── modules/             # Модули приложения
│   ├── users/           # Модуль пользователей
│   │   ├── dto/         # Data Transfer Objects
│   │   ├── entities/    # Сущности TypeORM
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── users.repository.ts
│   │
│   ├── auth/            # Модуль аутентификации
│   └── ...
│
├── common/              # Общие компоненты
│   ├── decorators/      # Пользовательские декораторы
│   ├── filters/         # Фильтры исключений
│   ├── guards/          # Guards (авторизация)
│   ├── interceptors/    # Интерцепторы
│   ├── pipes/           # Преобразование и валидация
│   └── ...
│
├── config/              # Конфигурации
│   ├── database.config.ts
│   ├── auth.config.ts
│   └── ...
│
└── shared/              # Переиспользуемые модули
    ├── types/           # Типы и интерфейсы
    ├── utils/           # Утилиты
    └── constants/       # Константы
```

#### Особенности организации в NestJS

- Каждый модуль содержит все необходимые компоненты (контроллеры, сервисы, сущности)
- Связанная функциональность группируется в одном модуле
- Модули экспортируют только необходимые компоненты через `exports` в модуле

## Инструменты для поддержания стиля кода

### ESLint

Используйте ESLint для статического анализа кода:

#### .eslintrc для фронтенда

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint"
  ],
  "rules": {
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "max-len": [
      "warn",
      {
        "code": 100
      }
    ]
  }
}
```

#### .eslintrc для бэкенда

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "max-len": [
      "warn",
      {
        "code": 100
      }
    ]
  }
}
```

### Prettier

Используйте Prettier для автоматического форматирования кода:

#### .prettierrc

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Хуки Git

Рекомендуется настроить pre-commit хуки с помощью husky и lint-staged:

#### package.json (фрагмент)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Настройка IDE

Настройте ваш редактор (WebStorm/VS Code) для автоматического форматирования при сохранении файла и проверки кода с
помощью ESLint.