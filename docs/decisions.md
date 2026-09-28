# Design Decisions — ACME Salary Management System

This document records the choices implemented for the assessment and the practical trade-offs accepted to keep the solution focused.

## 1. Rails API, React frontend, and PostgreSQL

**Decision:** Use Rails in API mode, React with TypeScript and Vite, and PostgreSQL in every environment.

**Reason:** The stack fits the role, supports exact decimal storage and relational history, and keeps frontend and backend responsibilities clear.

**Trade-off:** Two applications require separate setup and deployment configuration.

## 2. One repository and one backend

**Decision:** Keep frontend, employee APIs, salary writes, and analytics in one repository with one Rails backend.

**Reason:** The assessment workflows share data and transaction boundaries and do not justify distributed services.

**Trade-off:** Backend features deploy together, which is acceptable at this scale.

## 3. REST JSON API

**Decision:** Expose a small REST API under `/api`.

**Reason:** Employee lookup, detail, salary creation, analytics, and health map directly to resource-oriented endpoints.

**Trade-off:** Frontend types and backend response shapes must be maintained together.

## 4. Append salary revisions

**Decision:** Every accepted salary change creates a `salary_revisions` record. Existing history has no update or delete endpoint.

**Reason:** HR can see previous amounts, effective dates, and reasons without destructive replacement.

**Trade-off:** History grows over time and current salary must be derived.

## 5. Derive current salary by effective date

**Decision:** Select the latest revision effective on or before today, ordered by `effective_from DESC, id DESC`.

**Reason:** Backdated records should not replace a later-effective salary, and record ID provides a deterministic same-date tie-breaker.

**Trade-off:** Future revisions remain stored but do not appear as current or in effective history until their date.

## 6. Row locking without version columns

**Decision:** Wrap salary creation in `employee.with_lock`. Do not add `lock_version`, a salary version counter, or a stale-edit token.

**Reason:** The lock provides a simple transaction boundary and serializes concurrent inserts for one employee.

**Trade-off:** A waiting request can still submit data from an outdated browser view. Explicit stale-edit detection is deferred.

## 7. Exact money and separate currencies

**Decision:** Store annual base salary as `decimal(15,2)` and keep currency on Employee. Support INR, USD, EUR, and GBP.

**Reason:** Decimal storage avoids floating-point errors, and separating currencies prevents meaningless combined totals.

**Trade-off:** Currency changes and exchange-rate conversion require a different historical model and are outside scope.

## 8. Bounded offset pagination and fixed ordering

**Decision:** Use offset pagination with 25 records by default, a maximum of 100, and fixed name ordering.

**Reason:** This keeps the API and UI straightforward for 10,000 employees.

**Trade-off:** Late pages can become slower and there is no user-selected sorting.

## 9. Controlled frontend filter values

**Decision:** Keep country, department, and currency options as small controlled frontend lists matching the seed dataset.

**Reason:** The assessment has no workflow for administering these values, so a filter-metadata endpoint would add little value.

**Trade-off:** Changes to seed categories require a coordinated frontend update.

## 10. SQL analytics without caching

**Decision:** Compute active headcount, department counts, and estimated monthly salary by currency in PostgreSQL on each request.

**Reason:** Set-based queries keep aggregation out of Ruby and return current results for the 10,000-employee dataset.

**Trade-off:** The current-salary query is more complex and repeated summary requests are not cached. Measure before optimizing.

## 11. Single unauthenticated demo context

**Decision:** Present one HR Manager context without login or roles.

**Reason:** Authentication and approvals are outside the assessment’s chosen scope.

**Trade-off:** Anyone with the API URL can access or change synthetic data. CORS limits browser origins but does not secure the API.

## 12. Deterministic synthetic seeds

**Decision:** Seed 10,000 employees using Faker with a fixed random source, controlled cycles, and batch writes.

**Reason:** Reviewers can reproduce a realistic dataset without real personal information.

**Trade-off:** The dataset is representative for demonstration, not a model of an actual organization.

## 13. Behavior-focused automated tests

**Decision:** Use RSpec and FactoryBot for Rails, and Vitest with React Testing Library for the frontend. Run quality checks in GitHub Actions.

**Reason:** These tests cover the main domain and user behaviors with fast feedback.

**Trade-off:** There is no full-browser end-to-end suite, concurrency stress test, or formal performance benchmark.

## 14. Render deployment

**Decision:** Deploy PostgreSQL and Rails on Render and use a Render static site for the React build.

**Reason:** Managed services keep the assessment deployment reproducible and small.

**Trade-off:** Plan limits, cold starts, and region affect observed performance and must not be confused with application query time.
