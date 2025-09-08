# Improvement Tasks Checklist

Note: Each item is actionable and intended to be checked off as work progresses. Tasks are ordered from foundational repo hygiene to backend, database, testing, frontend, performance/observability, security, and delivery concerns.

1. [x] Create a top-level README with project overview, setup (Backend .NET, Frontend React), run instructions, and troubleshooting.
2. [ ] Add a CONTRIBUTING.md describing branching strategy, commit conventions, code review, and PR checklist.
3. [ ] Define an explicit LICENSE file for the repository.
4. [ ] Introduce EditorConfig to enforce consistent code style across C# and TypeScript.
5. [ ] Add .gitignore entries for build artifacts, logs, coverage, SQLite db files, node_modules (verify existing ignore list).
6. [ ] Set up basic CI (e.g., GitHub Actions) to build backend (net9.0) and run tests; build frontend and run unit tests/lint.

Backend architecture and API
7. [x] Move EF Core DbContext registration to DI: register BookContext via AddDbContext with scoped lifetime rather than manual `new BookContext()` in endpoints.
8. [x] Extract endpoints to a dedicated minimal API module (e.g., static class with MapGroup "/api/books") to reduce Program.cs size and improve testability.
9. [ ] Introduce request/response DTOs for Book create/update/read to decouple API from internal entity and control surface (e.g., omit Id on create).
10. [ ] Add FluentValidation or model validation filters for declarative validation instead of manual `IsNotValidBook` calls.
11. [ ] Implement centralized error handling middleware to provide consistent problem details (RFC 7807) responses.
12. [ ] Add API versioning (e.g., Asp.Versioning) and route versioning (v1) for forward compatibility.
13. [x] Enable minimal API endpoint metadata for all routes (Produces/Consumes, status codes, summaries) and ensure Swagger docs accurate.
14. [x] Add CORS configuration via configuration settings and environment-based origins; avoid hardcoding `http://localhost:5173`.
15. [x] Externalize app settings (connection string for SQLite, seeding toggles) into appsettings.{Environment}.json.

Persistence and data model
16. [ ] Make Book entity a public class (not internal record) or keep as record but align with EF Core recommendations; review init setters vs EF proxies.
17. [ ] Add EF Core Migrations and replace EnsureCreated with Migrate on startup.
18. [ ] Separate seeding logic into an IDataSeeder service and guard by environment/config.
19. [ ] Add constraints and indexes (e.g., optional index on Genre for stats and Author for queries).
20. [ ] Validate PublishedDate bounds (reasonable ranges) and normalize Genre casing.
21. [ ] Consider splitting read models for stats to avoid grouping on hot path; optionally use compiled queries.

Testing strategy
22. [ ] Split integration tests into a dedicated test project and use WebApplicationFactory for host bootstrapping.
23. [ ] Add unit tests for validation and service logic (DTO mapping, validators), not just endpoint happy paths.
24. [ ] Add negative-path tests (400 for invalid payloads, 404 for missing resources on GET/PUT) and concurrency tests.
25. [ ] Introduce test data builders and deterministic seeding for test repeatability (avoid Random in tests).
26. [ ] Add frontend unit tests for components (Books list, add/edit/delete flows) and API client mocks.
27. [ ] Add contract tests or Swagger/OpenAPI schema validation to ensure frontend-backend compatibility.

Observability, logging, and diagnostics
28. [ ] Configure structured logging with Microsoft.Extensions.Logging and enrich with correlation IDs.
29. [ ] Add request logging and minimal tracing (ActivitySource/OpenTelemetry) for API spans.
30. [ ] Surface health checks endpoints (/health, /ready) and wire into CI/CD and container orchestrator probes.

Performance and robustness
31. [ ] Add pagination for GET /api/books to avoid returning unbounded lists.
32. [ ] Add ETag or Last-Modified headers for GETs and support conditional requests where applicable.
33. [ ] Validate and limit payload sizes; set reasonable Kestrel limits.
34. [ ] Use AsNoTracking for read-only queries to improve performance.
35. [ ] Optimize /api/books/stats with projection/compiled query and ensure null-safe Genre grouping.

Security and compliance
36. [ ] Add authentication/authorization (e.g., JWT bearer) and protect write endpoints.
37. [ ] Validate and sanitize inputs; ensure proper model binding error responses (ProblemDetails).
38. [ ] Add HTTPS redirection/HSTS for production and ensure Swagger UI disabled or secured in production.
39. [ ] Review CORS to allow only necessary origins and methods based on environment.
40. [ ] Scan dependencies and enable Dependabot or Renovate for updates.

Frontend architecture and UX
41. [ ] Introduce a dedicated API client module with typed DTOs and error handling; avoid in-component fetch logic.
42. [ ] Add global state management or react-query for server state (caching, loading, error states).
43. [ ] Implement loading skeletons and error toasts for all CRUD operations.
44. [ ] Add form validation with proper constraints matching backend validators.
45. [ ] Ensure TypeScript strict mode and fix any implicit anys; add ESLint and Prettier configs.
46. [ ] Add accessibility checks (aria labels, focus management) and keyboard navigation support.
47. [ ] Implement routing for views (list/detail/edit) and deep linking.

DevEx and delivery
48. [ ] Provide Dockerfile(s) for backend and frontend; add docker-compose for local dev (API + DB + frontend).
49. [x] Add makefile or dev script (e.g., ./scripts/dev.sh) to run full stack with hot reload.
50. [ ] Cache EF Core SQLite database location under project data directory instead of temp; allow override via env var.
51. [ ] Add environment variable documentation and sample .env files for frontend/backend.
52. [ ] Set up release workflow: semantic versioning, changelog generation, and artifact publishing.

Quality and cleanup
53. [ ] Remove dead code and comments; extract magic numbers (e.g., random generation bounds) into constants.
54. [ ] Replace Random-based data generation in production seeding with deterministic, meaningful seed data.
55. [ ] Add XML doc comments and update Swagger descriptions for all endpoints and DTOs.
56. [ ] Ensure nullability annotations are enabled and fix warnings (C# nullable reference types, TS strict null checks).
57. [ ] Add code analyzers (FxCop analyzers/StyleCop) and treat warnings as errors in CI.
