# Architecture — ACME Salary Management System

## Overview

The system is a monorepo with a React frontend, a Rails JSON API, and PostgreSQL.

```text
React + TypeScript
        |
        | HTTPS / JSON
        v
Ruby on Rails API
        |
        | Active Record / SQL
        v
PostgreSQL
```

The frontend handles navigation, forms, presentation, and user-facing states. Rails owns validation, persistence, current-salary selection, pagination, filtering, and analytics. PostgreSQL stores employees and append-only salary revisions.

## Components

| Component | Responsibility |
| --- | --- |
| React frontend | Summary, employee directory, employee details, salary form, loading and error states |
| Rails API | Request parameters, validation, row-locked salary writes, current-salary logic, and JSON responses |
| PostgreSQL | Employee and salary history storage, uniqueness, foreign keys, sorting, filtering, and aggregation |
| GitHub Actions | Backend and frontend tests, lint, security checks, and frontend build |
| Render | Rails web service, managed PostgreSQL, and React static-site target |

## API

| Method | Endpoint | Behavior |
| --- | --- | --- |
| `GET` | `/api/health` | Returns service status |
| `GET` | `/api/employees` | Searches, filters, orders, and paginates active employees |
| `GET` | `/api/employees/:id` | Returns employee details, current salary, and effective history |
| `POST` | `/api/employees/:id/salary_revisions` | Appends a validated salary revision under an employee row lock |
| `GET` | `/api/analytics/summary` | Returns active headcount, department breakdown, and estimated monthly salary by currency |

Employee list parameters are `search`, `country`, `department`, `currency`, `page`, and `per_page`. Results use a fixed `last_name`, `first_name`, and `id` order. Custom sorting is outside the implemented scope.

## Read flow

```text
Browser -> React page -> Rails endpoint -> Active Record query -> PostgreSQL
Browser <- JSON response <- Rails serializer logic <- query result
```

The employee detail endpoint eager-loads salary revisions and derives current salary from revisions effective on or before today. The summary uses a PostgreSQL subquery to select one current salary per employee before grouping monetary values by currency.

## Salary write flow

```text
Submit form
    -> find employee
    -> lock employee row
    -> validate and insert salary revision
    -> return 201 or validation errors
    -> update employee page
```

The lock serializes writes for one employee. There is no `lock_version`, salary version counter, or stale-form token.

## Security boundary

The demonstration has no authentication and uses synthetic data only. Rails permits browser requests from the configured `FRONTEND_ORIGIN`, validates allowed parameters, and uses Active Record query binding. CORS is not authentication, so the service must not contain real salary data.

## Deployment

```text
GitHub repository
       |
       +--> GitHub Actions
       |
       +--> Render Rails web service --> Render PostgreSQL
       |
       +--> Render static site for React
```

The Rails API is live on Render. Deployment secrets are configured in Render environment variables. Database migrations run as part of deployment configuration, while seed data is run explicitly rather than on every application start.

## Testing

- RSpec model and request specs exercise Rails behavior with PostgreSQL.
- Vitest and React Testing Library exercise UI behavior with mocked API boundaries.
- GitHub Actions runs both suites, lint, security scans, and the production frontend build.
- Browser end-to-end tests and formal performance benchmarks remain outside the implemented scope.
