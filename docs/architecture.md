# Architecture — ACME Salary Management System

## Overview

The system uses a React frontend, a Rails API, and PostgreSQL. One backend handles employees, salary revisions, and analytics. Frontend and backend share a repository and deploy separately.

```text
┌─────────────────────────────┐
│ React + TypeScript          │
│ Frontend in the browser     │
└──────────────┬──────────────┘
               │ HTTPS / JSON
               ▼
┌─────────────────────────────┐
│ Ruby on Rails API           │
│ Application logic           │
└──────────────┬──────────────┘
               │ SQL / database connection
               ▼
┌─────────────────────────────┐
│ PostgreSQL                  │
│ employees / salary revisions│
└─────────────────────────────┘
```

The browser calls the API over HTTPS. Rails connects to PostgreSQL through its database driver.

## Why a monolith?

A single backend keeps business logic, transactions, testing, and deployment straightforward. Start with database queries and appropriate indexes for the 10,000-employee dataset; verify performance before adding caching, queues, or separate services.

## Component responsibilities

| Component | Responsibilities | Technology |
| --- | --- | --- |
| Frontend | Employee directory, profiles, salary forms, and dashboard; loading, error, and conflict states. | React, TypeScript, Vite |
| Backend | Request validation, salary rules, transactional writes, filtering, pagination, and reporting. | Ruby on Rails, Active Record |
| Database | Employee and salary-revision storage, constraints, row locking, and exact monetary aggregation. | PostgreSQL |

The backend owns business rules and financial calculations. Client-side validation provides immediate feedback. Schema and salary-change logic are detailed in [data-model.md](data-model.md); trade-offs are in [decisions.md](decisions.md).

## API boundary

Use a JSON REST API under `/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/employees` | Search, filter, sort, and paginate employees. |
| GET | `/api/employees/:id` | Employee details, current salary, and latest revision ID. |
| GET | `/api/employees/:id/salary_revisions` | Paginated salary history. |
| POST | `/api/employees/:id/salary_revisions` | Create a salary revision with a stale-edit check. |
| GET | `/api/analytics/summary` | Filtered headcount and per-currency salary statistics. |
| GET | `/api/health` | Minimal service health status. |

- **Pagination:** `page` and `per_page`; default 25, maximum 100.
- **Filtering:** `search`, `country`, `department`, and `currency` where applicable.
- **Sorting:** Allowlisted `sort_by` and `sort_dir`; salary sorting requires one currency.
- **Responses:** Decimal strings for money and consistent field errors. Use 200/201 for success, 400 for malformed requests, 404 for missing resources, 409 for stale edits, and 422 for validation failures.

The demo has no login and uses synthetic data only. Keep secrets outside Git, validate requests, parameterize queries, and restrict CORS to the frontend origin. CORS does not provide authentication.

## Deployment architecture

Target Render for the frontend, Rails service, and managed PostgreSQL database.

```text
GitHub Repository
        │
        ▼
GitHub Actions CI
Tests · Lint · Build
        │
        │ Checks pass
        ▼
Render Deployment
        ├── Static Site       → React frontend
        └── Web Service       → Rails API
                │
                ▼
        Render Managed PostgreSQL
```

This release flow is planned, not yet configured. Deploy only after checks pass. Verify hosting plans and runtime compatibility during setup; keep credentials in server-side environment configuration and run demo seeding explicitly, not on every deployment.

## Testing approach

| Layer | Tools | Focus |
| --- | --- | --- |
| Domain and database | RSpec, FactoryBot | Salary rules, effective dates, constraints, and history preservation. |
| API | RSpec | Request contracts, pagination, validation, and concurrent-update conflicts. |
| Frontend | Vitest, React Testing Library | User interactions, forms, and error states. |
| CI | GitHub Actions, RuboCop, ESLint | Tests, lint, type checks, and frontend build. |

**Test-Driven Development (TDD):** For core business behavior, follow **Red → Green → Refactor**: write a failing test, implement the minimum passing code, then refactor while keeping tests green.
