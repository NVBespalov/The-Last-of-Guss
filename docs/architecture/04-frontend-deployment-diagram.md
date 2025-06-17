# C4 - Диаграмма развертывания Frontend (Deployment diagram)

Показывает, как основные компоненты приложения развёрнуты и взаимодействуют в инфраструктуре.

```mermaid
flowchart TB
    App["App (корневой компонент)"]
    Route["Маршрутизация (например, React Router)"]
    Pages["Pages (Страницы)"]
    Widgets["Widgets (Виджеты)"]
    Features["Features (Бизнес-фичи)"]
    Entities["Entities (Сущности)"]
    Shared["Shared (Шаред-компоненты, утилиты, хуки)"]
    Store["Redux Store (слайсы и middleware)"]
    API["API и сервисы"]
    MUI["Material UI"]
    RHF["React Hook Form"]
    App --> Route
    App --> Pages
    Pages --> Widgets
    Widgets --> Features
    Features --> Entities
    Features --> Widgets
    Features --> Store
    Entities --> Store
    Pages --> Features
    Widgets --> Store
    Entities --> API
    Features -.-> RHF
    Shared --> Features
    Shared --> Entities
    Shared --> Widgets
    Shared -.-> MUI
    Shared -.-> RHF
 ```