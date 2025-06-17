# C4 - Диаграмма развертывания бэкенда (Deployment diagram)

Следующая схема отражает типовое продакшн‑развёртывание бэкенда:


```mermaid
flowchart TD
    Dev["Разработчик"]
    GH["GitHub"]
    Action["GitHub Actions Runner"]
    Registry["Container Registry: GHCR/DockerHub"]
    Client["Клиенты (Web, Mobile)"]
    LB["Load Balancer (Nginx, HAProxy)"]
    API1["Backend API Instance #1 (Node.js, NestJS)"]
    API2["Backend API Instance #2 (Node.js, NestJS)"]
    Redis["Redis Cache"]
    DB["PostgreSQL Database"]
    Storage["Object Storage: S3/Minio"]
    SMTP["Email/SMTP"]
    External["Внешние сервисы (Платежи, CRM, API и др.)"]

    Dev -- "push/pull request" --> GH
    GH -- triggers --> Action
    Action -- "docker build & push" --> Registry

    Registry -- "docker pull/deploy" --> API1
    Registry -- "docker pull/deploy" --> API2

    Client -->|HTTPS| LB
    LB -->|HTTP| API1
    LB -->|HTTP| API2
    API1 --- Redis
    API2 --- Redis
    API1 --- DB
    API2 --- DB
    API1 -- "Файлы" --> Storage
    API2 -- "Файлы" --> Storage
    API1 -- Email --> SMTP
    API1 -- API --> External
    API2 -- API --> External
 ```



---

## Объяснение компонентов CI/CD
- **GitHub Actions Runner** — запускает пайплайн: линтинг, тесты, сборку, публикацию Docker-образа в реестр (GHCR или Docker Hub), автодеплой (например, через SSH/kubectl/helm).
- **Registry** — Docker-образ из CI публикуется в реестр для дальнейшего деплоя.
- **API инстансы** — обновляются автоматически (pull нового образа), возможен zero-downtime деплой через оркестратор (K8s, Docker Swarm).

---

## Поток CI/CD
1. **Разработчик** отправляет изменения (push, pull request) в GitHub.
2. **GitHub Actions** запускает сборку, тесты, создает контейнер, пушит в **Registry**.
3. На продакшн-среде деплой-инфраструктура обновляет приложение из нового Docker-образа.
4. Сервисы доступны через балансировщик, остальная инфраструктура не меняется.

---

## Безопасность
- Секреты (keys, access tokens) хранятся в **GitHub Secrets**.
- Доступ в продакшн только через CI/CD runner.
- Разграничение ролей между разработчиками, CI/CD, инфраструктурой.

---