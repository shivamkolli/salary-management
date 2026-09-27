# Design Decisions — ACME Salary Management System

**MVP design · Draft for review**

This document explains the proposed technical choices behind the [product requirements](requirements.md), the alternatives considered, and their consequences. These are implementation plans, not claims of completed work. Review each decision when its implementation begins and update it when evidence changes the design.

## 1. Backend: Ruby on Rails

**Decision:** Use Ruby on Rails in API-only mode for the backend.

**Reason:** Rails matches the target ROR role and provides conventions for validation, relational persistence, transactions, and HTTP APIs.

**Alternative considered:** Another backend framework, such as Node.js with Express or NestJS.

**Trade-off:** The team must work within Rails conventions and maintain a separate frontend application. Framework choice alone does not establish performance; measure the actual workload.

## 2. Database: PostgreSQL across environments

**Decision:** Use PostgreSQL in development, test, and deployment.

**Reason:** One database engine reduces differences in SQL, constraints, and transactional behavior across environments. Exact numeric storage supports salary calculations.

**Alternative considered:** SQLite throughout, or SQLite locally with PostgreSQL in deployment.

**Trade-off:** PostgreSQL requires a local service and database configuration. Pin compatible versions during setup rather than copying versions from the reference project.

## 3. Architecture: One backend application

**Decision:** Keep employees, salary changes, and reporting within one Rails application, with the React frontend in the same repository.

**Reason:** The workflows share data and transaction boundaries. One backend keeps deployment, debugging, and development manageable for the assessment.

**Alternative considered:** Separate employee, compensation, and analytics services.

**Trade-off:** Backend modules share a deployment lifecycle. Separate services would allow independent deployment but add network and consistency concerns. Revisit boundaries only for a demonstrated need; 10,000 records is not a concurrency estimate.

## 4. API: REST with JSON

**Decision:** Expose resource-oriented JSON endpoints for `employees` and `salary_revisions`.

**Reason:** The UI has a small set of defined workflows that map naturally to HTTP resources and explicit error responses.

**Alternative considered:** GraphQL with client-selected response fields.

**Trade-off:** REST response shapes require deliberate coordination with the UI. Define request contracts, permitted filters, pagination, and error codes in request tests. Send monetary values as decimal strings to preserve precision.

## 5. Salary revision: Append records

**Decision:** Create a new `salary_revisions` record for every accepted change, with an amount, effective date, required reason, server-managed timestamps. Do not expose history editing or deletion.

**Reason:** HR must be able to inspect previous values and understand why compensation changed.

**Alternative considered:** Overwrite a current salary field without preserving prior values.

**Trade-off:** History adds storage and query complexity. Corrections become new entries. Without authentication, records cannot establish who made a change; application-level append-only behavior is not tamper-proof storage.

## 6. Current salary: Effective date with explicit precedence

**Decision:** Derive current salary from `SalaryRevision` records effective on or before the UTC business date, ordered by `effective_from DESC, id DESC`. Allow backdating on or after employment starts; reject future dates in the MVP.

**Reason:** Effective date describes when a salary applies, while entry time describes when it was recorded. A backdated entry must not automatically replace a later-effective salary.

**Alternative considered:** Always choose the most recently entered record, or maintain a separate current salary amount on Employee.

**Trade-off:** Reads need a shared latest-effective-record query and supporting tests. Same-date corrections use the higher record ID while retaining earlier entries. All revision inserts acquire the employee lock before allocating an ID; this makes ID ordering meaningful within that employee’s history. Effective-date and tie-breaking policies remain working assumptions to confirm before implementation.

## 7. Concurrent changes: Row locking and stale-edit detection

**Decision:** Use `employee.with_lock` and compare the submitted latest revision ID before creating a salary revision. No version columns are needed.

**Reason:** The lock serializes writes; the revision ID detects outdated forms, including changes caused by backdated entries.

**Alternative considered:** Rails optimistic locking with `lock_version`.

**Trade-off:** Updates to the same employee may wait. Keep transactions short, require every salary write to follow this flow, and return HTTP 409 for stale submissions.

## 8. Money and currencies: Exact values and separate reporting

**Decision:** Declare salary amount with Rails `t.decimal :amount, precision: 15, scale: 2, null: false` (PostgreSQL `numeric(15,2)`), validate positive amounts and reject excess fractional precision. Keep each employee’s currency fixed; initially support INR, USD, EUR, and GBP. Aggregate and rank salary only within a currency.

**Reason:** Exact representation and explicit currency boundaries keep salary comparisons meaningful.

**Alternative considered:** Floating-point amounts, integer minor units, or exchange-rate normalization to one reporting currency.

**Trade-off:** NUMERIC requires explicit API serialization and rounding rules. Integer minor units are also valid but require unit conversion. No single monetary total spans currencies. Currency changes and FX normalization would require additional historical and valuation policies.

## 9. Authentication: Outside the demo scope

**Decision:** Provide a single HR Manager demo context without login, user roles, or authenticated actor attribution.

**Reason:** The agreed MVP focuses on employee lookup, salary history, and compensation analysis using synthetic data.

**Alternative considered:** An authenticated HR account with session-based access.

**Trade-off:** Anyone who can reach the demo API can access or alter its synthetic data. It is unsuitable for real compensation data. Keep secrets outside Git, validate requests, parameterize queries, and restrict browser CORS to the frontend origin; CORS does not prevent direct API access.

## 10. Pagination: Server-side and bounded

**Decision:** Paginate employee and history lists on the server, using 25 records by default and a maximum of 100. Start with offset pagination and deterministic sorting with a unique tie-breaker.

**Reason:** Bounded responses keep browser payloads manageable and let the database apply filters and sorting before pagination.

**Alternative considered:** Load the entire dataset into the browser, or start with cursor pagination.

**Trade-off:** Browsing requires additional requests, and concurrent changes can shift offset pages. Cursor pagination adds contract complexity; reconsider it if measured late-page performance or navigation consistency requires it. Salary sorting requires a selected currency.

## 11. Analytics: SQL over current salaries

**Decision:** Calculate headcount, totals, average, and median in PostgreSQL using exactly one current salary per employee. Apply filters before aggregation and group monetary results by currency. Start without caching.

**Reason:** The database can perform set-based calculations without transferring the full employee and salary history dataset into Ruby or the browser.

**Alternative considered:** Application-side aggregation or precomputed, cached summaries.

**Trade-off:** Latest-effective-record selection and median queries need careful tests. Define median as the middle amount, or the exact average of the two middle amounts for an even count. Round displayed averages and medians to two decimals; empty groups have no average or median. Measure query plans before adding indexes or caching.

## 12. Frontend: React, TypeScript, and Vite

**Decision:** Build a React client with TypeScript and Vite, keeping domain validation and calculations in Rails.

**Reason:** This meets the assessment’s UI constraint and supports interactive search, forms, and dashboards without requiring server rendering.

**Alternative considered:** Next.js with a server-rendered application.

**Trade-off:** The browser must handle loading, errors, and data fetching explicitly. Frontend types do not validate incoming API data or replace backend checks. Choose a component library during UI setup based on accessibility and the required controls.

## 13. Employee attributes: Controlled string values

**Decision:** Store country, department, and job title as controlled strings on read-only seeded employee profiles.

**Reason:** The MVP has no workflow for administering these entities; controlled seed values keep filters consistent.

**Alternative considered:** Separate lookup tables with foreign keys and administration workflows.

**Trade-off:** Strings do not provide lookup-table referential integrity, and future renames require coordinated updates. Introduce lookup entities if managing organizational structure becomes part of the product.

## 14. Deployment: Render as the target

**Decision:** Target a Render deployment with a Rails web service, React static site, and PostgreSQL database.

**Reason:** Render is the agreed deployment target for the Rails service, React static site, and PostgreSQL database. Verify available plans and runtime support when setting up deployment.

**Alternative considered:** Another managed hosting platform or directly managed cloud infrastructure.

**Trade-off:** Hosting cost, persistence, capacity limits, and idle behavior depend on the selected plan. Record verified settings during deployment rather than assuming a free tier or database size limit. Keep the demo synthetic and document its operational limitations.
