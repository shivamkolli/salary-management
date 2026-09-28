# Performance

## Current status

The application is designed for the assessment dataset of 10,000 employees, but no formal latency or load benchmark has been run. This document records implemented controls, known query costs, and a reproducible measurement plan. It does not claim production capacity or a response-time target.

## Implemented controls

- Employee results are paginated in PostgreSQL with a default of 25 and a maximum of 100 records.
- Search and filters are applied before limit and offset.
- Employee ordering includes the record ID as a deterministic tie-breaker.
- The employee detail endpoint eager-loads salary revisions, avoiding an N+1 query for history and current salary.
- Salary analytics select one current revision per employee in SQL with PostgreSQL `DISTINCT ON`, then aggregate by currency in the database.
- Headcount and department breakdowns are database aggregates rather than Ruby loops over all employees.
- The seed script writes employees and initial salary revisions in batches of 1,000.
- No cache, background job, or additional service is introduced without evidence of a bottleneck.

## Existing indexes

The implemented schema contains:

- Unique B-tree index on `employees.employee_number`
- Unique B-tree index on `employees.email`
- B-tree index on `salary_revisions.employee_id`

These support identifier lookups, uniqueness, and association loading. The project does not claim that they optimize every search or analytics query.

## Known trade-offs

- Name and employee-number search use leading-wildcard `ILIKE`. PostgreSQL may scan matching rows because ordinary B-tree indexes do not optimize this pattern.
- Offset pagination becomes more expensive on late pages, although the 10,000-record assessment dataset is modest.
- Current-salary analytics order revisions by `employee_id`, `effective_from`, and `id`; the schema does not yet have a matching composite index.
- Employee details load all revisions for one employee and sort them in Ruby. This avoids N+1 queries but could become expensive with unusually long histories.
- Summary aggregates run on every request. There is no cache, so results remain current at the cost of repeated database work.
- Render plan size, region, database placement, and cold starts can dominate observed response time. Hosting latency should be reported separately from database execution time.

These are candidates for measurement, not automatic reasons to add indexes or caching. At 10,000 employees, a sequential scan may still be the database’s correct plan.

## Measurement plan

1. Record the commit, Ruby and PostgreSQL versions, Render plan and region, worker count, and database connection-pool size.
2. Start from a clean database and run the deterministic 10,000-employee seed.
3. Warm the service before measuring so platform cold starts are recorded separately.
4. Exercise these scenarios:
   - First and late employee pages
   - Name search, employee-number search, and no-match search
   - Country, department, and currency filters
   - Employee detail with short and long salary histories
   - Analytics summary
   - Salary revision creation
5. Collect enough samples to report p50, p95, maximum, error rate, and response size at concurrency 1 and a small concurrent workload.
6. Inspect important reads with `EXPLAIN (ANALYZE, BUFFERS)` in an isolated synthetic environment.
7. If a query is slow, change one factor at a time and preserve before-and-after plans and measurements.
