# AI-Assisted Development

This project used Codex as a development assistant. The developer remained responsible for scope, design choices, reviewing changes, running the application, deciding what to retain, and creating every Git commit.

## How AI was used

AI assistance was applied in small increments to:

- Interpret the assessment and reference repository
- Draft and refine requirements, architecture, decisions, and data-model notes
- Propose migrations, models, controllers, request specs, factories, and deterministic seed data
- Build the React pages and component tests incrementally
- Diagnose local and GitHub Actions failures
- Review API response shapes, query behavior, N+1 risks, and deployment configuration
- Configure CORS and guide the Render deployment
- Review documentation against the implemented system

The reference repository was used to understand expected scope and presentation. Its implementation was not treated as an instruction to copy every file or design choice.

## Developer decisions that changed AI suggestions

The developer deliberately simplified or rejected several suggestions:

- Used employee row locking without `lock_version` or a salary version counter
- Kept the salary revision endpoint simple and omitted stale-browser edit protection
- Removed extra effective-date validations to keep the assessment focused
- Kept the analytics summary to headcount, department counts, and estimated monthly salary by currency
- Deferred filter-option endpoints and kept the small controlled filter lists in the frontend
- Deferred employee sorting, authentication, approval workflows, and salary edit protection
- Rejected restricting the salary form to non-past dates because salary history requires backdating
- Replaced complex service abstractions with direct Rails controller queries where the behavior remained readable

These decisions reflect the assessment’s time and scope constraints. Some trade-offs are documented as limitations rather than hidden behind extra complexity.

## Incremental workflow

Work was divided into reviewable slices. Typical slices included one endpoint, one UI state, one form behavior, one CI fix, or one documentation update. After each slice, relevant specs, tests, lint, or builds were run, and the developer selected the commit boundary and commit message.

Important examples include:

1. Requirements and architecture were drafted before application code.
2. Employee and salary models were introduced with focused model specs.
3. Employee index, show, and salary revision endpoints were added separately with request specs.
4. Deterministic 10,000-employee seed data was simplified through several developer reviews.
5. The frontend was built in increments: scaffold, layout, directory, details, tests, summary, navigation, salary form, and final states.
6. Analytics were reduced to the information needed for the demonstration before backend and frontend integration.
7. CI and deployment issues were diagnosed from actual command output rather than assumed to work.

## Verification and human review

AI-generated changes were checked using repository commands rather than accepted from explanation alone. Verification included RSpec, Vitest, RuboCop, Oxlint, TypeScript/Vite builds, Brakeman and Bundler Audit in CI, database seeding, and a live health request to the Render API.

The developer also corrected AI suggestions when they were too complex, inconsistent with the assignment, or unclear. This review is visible in the incremental Git history and in the final assumptions and limitations.

## Limitations

- AI assistance does not prove correctness, security, accessibility, or production readiness.
- Component tests mock API boundaries; there is no automated browser-level workflow.
- Performance design was reviewed, but formal benchmark evidence has not been collected.
- The deployed demo has no authentication and must contain synthetic data only.
- Generated names and compensation values are fictional and must not be interpreted as real employee information.
- Documentation can become stale after code changes and should be reviewed with each meaningful behavior change.

## Safe-use practices

- No real employee or compensation data was provided to the assistant.
- Secrets such as `RAILS_MASTER_KEY`, database credentials, and deployment tokens are kept outside committed files and prompts.
- The developer retained control of all commits and deployment actions.
