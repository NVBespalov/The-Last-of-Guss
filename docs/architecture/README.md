# Архитектурная документация проекта

Здесь собраны основные диаграммы архитектуры по методологии C4 для описания построения нашего приложения.

---

## Содержание

- [01-context.md](01-context.md) — Контекстная диаграмма (C4-1): как наше приложение взаимодействует с внешними пользователями и системами.
- [02-container.md](02-container.md) — Диаграмма контейнеров (C4-2): структура из крупных блоков (frontend, backend, база данных).
- [03-components-backend.md](03-components-backend.md) — Диаграмма компонентов монолита (C4-3): разбивка backend на логические модули.
- [04-frontend-deployment-diagram.md](04-frontend-deployment-diagram.md) - Диаграмма развертывания фронтенд
- [05-backend-deployment-diagram.md](05-backend-deployment-diagram.md) - Диаграмма развертывания бэкенда

---

## Как читать архитектуру

1. **Контекстная диаграмма** — стартовая точка; отображает пользователей, наше приложение и внешние интеграции.
2. **Диаграмма контейнеров** — уровень системы: фронтенд, backend (монолит), база данных и сервисы.
3. **Диаграмма компонентов backend** — детализация серверного монолита, основные модули, которые реализуют логику, авторизацию, интеграции.

---

## Примечания

- Диаграммы записаны на языке [Mermaid.js](https://mermaid.js.org), их можно просматривать и экспортировать как изображения с помощью встроенных средств GitLab, VS Code (расширение Draw.io/Markdown Preview Mermaid Support) или онлайн-редакторов.
- Если архитектура изменится (например, переход к микросервисам), структура и схемы будут дополнены новыми файлами.
- Для детального описания конкретных модулей/слоев или добавления других диаграмм (развертывания, интерфейсов, фронтенда) — создайте дополнительные Markdown-файлы в этой папке.

---

## Как обновлять

1. Вносите изменения в существующие `.md`-файлы для актуализации архитектуры.
2. При необходимости, добавляйте новые схемы (например, `04-deployment.md` для схемы развертывания).
3. Поддерживайте согласованность между архитектурой и исходным кодом.

---

### Ответственный за архитектурную документацию:
*Nick, контакт: @NVBespalov*
