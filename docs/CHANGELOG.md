# Changelog

Все значимые изменения в этом проекте будут документироваться в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Документация

### [1.0.0] - 2025-06-17

#### Добавленно

- CHANGELOG.md initialization.
- Added structure and initial content of project documentation in the `docs` folder:
    - SRS.md — software requirements, links to all sections.
    - 01-users-and-roles.md — description of user roles (player, nikita, admin).
    - 02-entities.md — description of domain entities (user, round, score).
    - 03-rounds-and-cooldown.md — rules for rounds and cooldown (see SRS).
    - 04-score-calculation.md — rules for score calculation and ignoring.
    - 05-exceptions.md — description of exception handling.
    - 06-multiservers-and-db.md — support for multiple backend servers and shared DB.
    - 07-user-stories.md — key User Stories and acceptance criteria.
    - 08-non-functional-requirements.md — non-functional requirements.
    - 09-constraints.md — fixed constraints.
    - 10-mvp-and-priorities.md — minimum viable product and priorities.

### Changed

- Initial revision of architecture description, error standards, exceptions and business logic in the `docs` folder.

## Product

### [0.1.0] - 2025-06-17

#### Added

- Initial project setup

[1.0.0]: /docs/

[0.1.0]: ./
