# Requirements — ACME Salary Management System

## Goal

Provide ACME’s HR manager with a web application for finding employees, reviewing compensation history, recording salary revisions, and viewing a concise organization summary for approximately 10,000 employees.

## Primary user

**HR Manager** — a non-technical user replacing spreadsheet-based salary lookup and maintenance with a searchable, consistent system.

## In scope

- Active employee directory
- Search by employee name or employee number
- Filters for country, department, and currency
- Server-side pagination
- Employee profile with employment details, current annual salary, and salary history
- Salary revision creation with amount, effective date, and required reason
- Summary with active headcount, department count, employees by department, and estimated monthly salary by currency
- Deterministic synthetic seed data for 10,000 employees
- Rails API, React frontend, PostgreSQL, CI, and Render deployment

## Core workflows

1. Open the summary to understand current workforce and compensation totals.
2. Search or filter the employee directory and move between result pages.
3. Open an employee to review profile and salary history.
4. Record a salary revision without overwriting prior records.
5. Review validation, empty, not-found, and network-error states.

## Business rules

- Salary represents gross annual base salary and excludes bonuses, benefits, taxes, and deductions.
- Salary must be greater than zero and requires an effective date and nonblank reason.
- A salary change appends a `salary_revisions` record; the API exposes no update or delete action for history.
- Current salary is the revision with the latest effective date on or before today. The higher record ID wins when effective dates match.
- Future-dated revisions do not affect current salary, visible history, or summary analytics until effective.
- Employees have a fixed currency from INR, USD, EUR, or GBP.
- Monetary totals remain separated by currency; no exchange-rate conversion is performed.
- Estimated monthly salary is calculated from current annual base salaries divided by 12. It is not a payroll calculation.
- Only active employees appear in the directory and summary.

## Non-functional requirements

- Paginate employee results with a default of 25 and maximum of 100.
- Serialize salary writes for the same employee with a database row lock.
- Keep secrets in environment configuration and restrict browser CORS to the deployed frontend origin.
- Use PostgreSQL in development, test, and deployment.
- Provide meaningful backend request/model specs and frontend component tests.
- Run tests, lint, security checks, and the frontend build in GitHub Actions.
- Keep the 10,000-employee seed repeatable and synthetic.

## Out of scope

- Authentication, authorization, SSO, and approval workflows
- Employee creation, editing, deletion, onboarding, or offboarding
- Payroll execution, tax, deductions, bank transfer, and payroll integrations
- Currency conversion
- Bulk spreadsheet import/export
- Dynamic administration of departments, countries, currencies, levels, or job titles
- Editing or deleting salary history
- Notifications, document management, localization, and native mobile apps
- Formal production capacity certification

## Assumptions and trade-offs

- The demo represents a single HR Manager and contains no real employee data.
- CORS limits browser origins but does not secure the public API; authentication is required before any real use.
- Employee filter values are controlled by the seed dataset and mirrored in the frontend.
- Row locking prevents overlapping writes for one employee, but the implementation does not reject a stale browser form after it waits.
- Offset pagination and substring search keep the API simple for 10,000 records; larger datasets may require cursor pagination and specialized search indexes.
- Salary history is not separately paginated because the demonstration gives each employee a small history.
