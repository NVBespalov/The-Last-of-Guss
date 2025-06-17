# Компонентная диаграмма: Модули бизнес-логики

> Взаимодействие основных доменных и сервисных модулей приложения (логика игры, обработка ошибок, гарантии целостности).
```mermaid

graph TD
 API[Backend API] --> Users[Users Module]
 API --> Rounds[Rounds Module]
 API --> Score[Score Module]
 API --> Exception[Exception Handling]
 Users --> DB[(Database)]
 Rounds --> DB
 Score --> DB
 Exception --> DB 

```


- Каждая часть логики отделена в свой модуль.
- Все изменения фиксируются транзакционно в базе.
- Подробнее:
    - [02-entities.md](02-entities.md)
    - [03-rounds-and-cooldown.md](03-rounds-and-cooldown.md)
    - [04-score-calculation.md](04-score-calculation.md)
    - [05-exceptions.md](05-exceptions.md)
