# ER-диаграмма портала «Водить.РФ»

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : submits
    USERS ||--o{ REVIEWS : writes
    APPLICATIONS ||--o| REVIEWS : receives

    USERS {
        int id PK
        string login UK
        string password_hash
        string full_name
        date birth_date
        string phone
        string email
        datetime created_at
    }

    APPLICATIONS {
        int id PK
        int user_id FK
        string transport_type
        date start_date
        string payment_method
        string status
        datetime created_at
    }

    REVIEWS {
        int id PK
        int user_id FK
        int application_id FK, UK
        int rating
        string content
        datetime created_at
    }
```

## Связи

- `users -> applications`: один пользователь может создать много заявок.
- `users -> reviews`: один пользователь может оставить много отзывов.
- `applications -> reviews`: у завершенной заявки может быть максимум один отзыв.

## Бизнес-правила

- логин пользователя уникален;
- заявка создается со статусом `Новая`;
- статус меняет только администратор;
- отзыв разрешен только для завершенной заявки.
