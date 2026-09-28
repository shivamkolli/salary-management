# Testing Strategy

This document describes the tests that exist in the implemented application. Tests focus on user-visible behavior, business rules, API contracts, and failure states. No coverage percentage is claimed, and the project does not claim that every change was developed with strict test-first TDD.

## Backend

RSpec runs against PostgreSQL with FactoryBot data.

### Model specs

- Employee level and currency allowlists
- Active employee scope
- Salary revision ordering by effective date and ID
- Current salary selection, including same-date precedence
- Salary revision associations
- Positive salary, effective-date presence, and reason presence validations

### Request specs

- Active employee listing and deterministic name ordering
- Default, custom, invalid, and maximum pagination values
- Case-insensitive full-name and employee-number search
- Country, department, and currency filtering
- Employee details, current salary, ordered salary history, and missing employees
- Successful salary append while retaining prior history
- Salary validation errors, malformed payloads, and missing employees
- Active headcount, department totals, and monthly salary totals by currency
- Health response and CORS allow/reject behavior

Salary revision request tests exercise the public API and database result. The write uses `employee.with_lock`; there is no dedicated multi-connection concurrency spec and no stale-edit token behavior.

Run the backend suite:

```bash
cd backend
bundle exec rspec
```

Run backend quality and security checks:

```bash
bin/rubocop
bin/brakeman --no-pager
bin/bundler-audit check --update
```

## Frontend

Vitest and React Testing Library exercise components with mocked API boundaries.

Covered behavior includes:

- API request paths
- Application header and sidebar navigation
- Employee filtering by currency
- Employee directory network and server errors with retry
- Employee details opening and closing the salary form
- Successful salary creation and API validation messages
- Form cancellation and repeated-submit protection
- Summary counts, monthly currency values, empty data, errors, and retry
- Frontend not-found navigation

Run the frontend suite and production checks:

```bash
cd frontend
npm test
npm run lint
npm run build
```

## Continuous integration

GitHub Actions runs on pushes and pull requests to `main`.

The backend job uses PostgreSQL and runs schema loading, RSpec, RuboCop, Brakeman, and Bundler Audit. The frontend job installs dependencies with `npm ci`, then runs Vitest, Oxlint, and the TypeScript/Vite production build.

## Verification evidence

On 2026-09-28, the local suites completed with:

- Backend: 32 examples, 0 failures
- Frontend: 15 tests, 0 failures
- Backend focused RuboCop checks: no offenses
- Frontend lint and production build: passed
- Deployed Rails health endpoint: HTTP 200 with `{"status":"ok"}`

These results describe that revision of the project and should be refreshed after behavior changes.

## Remaining verification

The following are deliberate gaps rather than completed work:

- No Playwright, Cypress, or other full-browser end-to-end suite
- No automated accessibility audit
- No multi-connection concurrency test
- No formal load or capacity benchmark
- No automated test of Render deployment configuration

Before presenting the project, manually verify the primary desktop and narrow layouts, keyboard navigation, a full salary revision workflow, direct navigation to React routes, and the deployed frontend-to-API connection.
