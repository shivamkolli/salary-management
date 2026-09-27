# ACME Salary Management System

**Product Requirements · MVP · Draft for review**

## Purpose

Give ACME’s HR team one reliable place to manage salary information for **10,000 employees across multiple countries**. The application will replace fragmented spreadsheets with searchable employee records, traceable salary changes, and clear compensation insights.

**Primary user:** An HR Manager who needs to find employee information, maintain accurate salaries, and answer questions about how the organization pays its people.

## Core capabilities

| Capability | What the HR Manager can do |
| --- | --- |
| **Employee directory** | Search by name or employee number, filter by country and department, and browse paginated results. Sort by name, or by salary within a selected currency. |
| **Employee profile** | View employment details, current annual base salary, currency, and salary history. |
| **Salary updates** | Enter a new amount, reason, and effective date. Save the change while preserving every previous salary record. |
| **Compensation dashboard** | View headcount, annual base-salary totals, average, and median by currency, country, and department. Apply filters consistently across the dashboard. |

## Business rules

- **Salary definition:** Gross annual base salary, excluding bonuses, benefits, taxes, and deductions. Amounts must be positive and stored with exact decimal precision.
- **Currency:** Each employee has one fixed currency. Initially support INR, USD, EUR, and GBP, with up to two decimal places. Never combine currencies in monetary totals, averages, medians, or salary rankings.
- **Effective dates:** Allow today or a past date on or after the employee’s start date. Future scheduling is excluded. Current salary is the entry with the latest effective date; the latest recorded version wins when dates match. A backdated entry may leave current salary unchanged. Use UTC as the demo’s business date.
- **History and consistency:** Require a reason for each change and record when it was entered. Save changes atomically; invalid or stale submissions must leave data unchanged. History remains available after reload.
- **Employee data:** Seeded profiles are read-only; salaries are editable. Use controlled country, department, and job-title values without separate administration screens.

Effective-date and same-date precedence rules are working assumptions to confirm before implementation.

## Quality and acceptance

- **Usability:** HR can find an employee, review salary, save a valid change, and inspect the resulting history. Provide clear loading, empty, validation, and conflict states.
- **Scale:** Seed exactly 10,000 synthetic employees using a repeatable script. Paginate directory and history results on the server, with 25 records by default and a maximum of 100. Record measured directory and analytics performance.
- **Accuracy:** Analytics use one current salary per employee. Verify totals, averages, and medians against known examples; empty results must not imply a zero average or median.
- **Engineering:** Build a Rails backend, React with TypeScript UI, and PostgreSQL database. Cover salary rules, effective dates, reporting, API behavior, and the principal browser workflow with meaningful, deterministic tests.
- **Demo access:** Use a single HR Manager context without login. History shows what changed, when, and why; it does not establish who made the change. Use synthetic data only, protect secrets, validate requests, parameterize queries, and restrict CORS to the frontend origin.

## Deliberate exclusions

| Excluded from the MVP | Reason |
| --- | --- |
| Authentication, roles, SSO, approvals, and notifications | Keep the assessment focused on the core HR workflow. Real employee data would require authenticated access. |
| Payroll execution, tax calculations, bank transfers, and payroll integrations | The product manages salary information; payment processing is a separate responsibility. |
| Employee onboarding/offboarding, profile creation/deletion, bulk editing, and spreadsheet import/export | Use seeded profiles to keep the first release focused on salary management. |
| Currency conversion and future-dated salary scheduling | Defer exchange-rate and scheduling policies beyond the initial release. |
| Document management, native mobile apps, localization, and histogram charts | Prioritize the required browser workflows and compensation summaries. |

## Delivery

Provide a working deployment targeted at **Render**, a video walkthrough, reproducible setup and seed instructions, and documentation of design decisions, AI assistance, and verification. Maintain incremental, developer-controlled Git history.
