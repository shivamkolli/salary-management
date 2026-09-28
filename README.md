# ACME Salary Management

A web application for an HR manager to browse employee records, review salary history, record salary revisions, and view a compensation summary for an organization of 10,000 employees.

The repository contains a Ruby on Rails JSON API, a React and TypeScript frontend, and deterministic synthetic seed data. It was built incrementally for a Software Engineer/Ruby on Rails staff-level assessment with AI-assisted development.

## Features

- Employee directory with name or employee-number search
- Country, department, and currency filters
- Server-side pagination with 25 employees per page and a maximum of 100
- Employee details with current annual salary and salary history
- Append-only salary revisions with amount, effective date, and reason
- Summary showing active employees, department count, employees by department, and estimated monthly salary by currency
- Loading, empty, validation, network-error, and not-found states
- Deterministic seed data for 10,000 synthetic employees

## Technology

| Area | Technology |
| --- | --- |
| Backend | Ruby 3.4.5, Rails 8.1 API |
| Database | PostgreSQL |
| Frontend | React 19, TypeScript, Vite |
| Backend tests | RSpec, FactoryBot |
| Frontend tests | Vitest, React Testing Library |
| CI | GitHub Actions, RuboCop, Brakeman, Bundler Audit, Oxlint |
| Deployment | Render web service, static site, and managed PostgreSQL |

## Repository structure

```text
backend/    Rails API, database migrations, seeds, and RSpec tests
frontend/   React application and component tests
docs/       Requirements, architecture, decisions, data model, and engineering notes
```

## Prerequisites

The project is tested with:

- Ruby 3.4.5 and Bundler 2.6.9
- Node.js 24 and npm
- PostgreSQL 18

Compatible nearby versions may work, but using the repository and CI versions reduces environment differences.

## Local setup

Clone the repository and prepare the backend:

```bash
cd backend
bundle install
bin/rails db:create db:migrate
bin/rails db:seed
```

The seed task creates or updates 10,000 deterministic synthetic employees and adds an initial salary revision only when a seeded employee does not already have one.

Start the API:

```bash
cd backend
bin/rails server
```

The API runs at `http://localhost:3000`. Verify it with:

```bash
curl http://localhost:3000/api/health
```

In another terminal, install and start the frontend:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. During local development, Vite proxies `/api` requests to Rails, so `VITE_API_BASE_URL` can remain empty.

## Environment variables

| Variable | Service | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Backend | PostgreSQL connection in deployment |
| `RAILS_MASTER_KEY` | Backend | Decrypts Rails credentials; never commit the key |
| `FRONTEND_ORIGIN` | Backend | Exact browser origin allowed by CORS; defaults to `http://localhost:5173` |
| `VITE_API_BASE_URL` | Frontend | Public Rails API URL used in the production build |

Production origins and URLs should not include a trailing slash.

## Test and quality commands

Backend:

```bash
cd backend
bundle exec rspec
bin/rubocop
bin/brakeman --no-pager
bin/bundler-audit check --update
```

Frontend:

```bash
cd frontend
npm test
npm run lint
npm run build
```

GitHub Actions runs these checks for pushes and pull requests to `main`. See [Testing strategy](docs/testing-strategy.md) for the verified scope and current limitations.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health |
| `GET` | `/api/employees` | Search, filter, and paginate active employees |
| `GET` | `/api/employees/:id` | Employee details, current salary, and history |
| `POST` | `/api/employees/:id/salary_revisions` | Append a salary revision |
| `GET` | `/api/analytics/summary` | Headcount and salary summary |

`GET /api/employees` accepts `search`, `country`, `department`, `currency`, `page`, and `per_page` parameters.

The deployed API health endpoint is:

[https://salary-management-api-5t0z.onrender.com/api/health](https://salary-management-api-5t0z.onrender.com/api/health)

## Assumptions and trade-offs

- The demo uses one unauthenticated HR Manager context and synthetic data. It is not suitable for real compensation data.
- Employee profiles are seeded and read-only. Only salary revisions can be created.
- A salary is gross annual base salary and excludes bonuses, benefits, tax, and deductions.
- Employees use INR, USD, EUR, or GBP. Reports keep currencies separate and perform no exchange-rate conversion.
- Current salary is the revision with the latest effective date on or before today; a higher record ID breaks same-date ties.
- Future-dated revisions do not affect current salary or analytics until their effective date.
- Salary writes acquire a row lock on the employee. The current implementation serializes concurrent writes but does not detect a stale browser form after it has waited for the lock.
- Monthly salary totals are estimates calculated as the sum of current annual salaries divided by 12. They are not payroll calculations.
- Directory filter values are intentionally fixed in the frontend because employee administration and filter metadata endpoints are outside this assessment.
- Search uses a case-insensitive substring query. Pagination and set-based analytics are appropriate for the 10,000-record demo, but formal capacity testing has not been performed.

Further rationale is recorded in [Design decisions](docs/decisions.md) and [Performance](docs/performance.md).

## Demonstration guide

1. Open **Summary** and show active headcount, department totals, and estimated monthly salary separated by currency.
2. Open **Employees**, search by a name or employee number, and apply country, department, and currency filters.
3. Open an employee to review employment details, current annual salary, and salary history.
4. Select **Revise salary**, enter a positive amount, effective date, and reason, then submit.
5. Confirm that the form closes, the new revision appears in history, and the current salary reflects the latest effective revision.
6. Return to **Summary** to show that analytics are loaded from the Rails API.
7. Optionally demonstrate the not-found page and a validation or network-error state.

## Documentation

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Design decisions](docs/decisions.md)
- [Data model](docs/data-model.md)
- [Testing strategy](docs/testing-strategy.md)
- [Performance](docs/performance.md)
- [AI-assisted development](docs/ai-assisted-development.md)
