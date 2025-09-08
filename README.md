# Simpler Book Library Application

A minimal full‑stack example consisting of:

- Backend: .NET 9 Minimal API with Entity Framework Core and SQLite (file stored under the OS temp directory).
- Frontend: React + TypeScript single‑page app.

The application lets you manage a small library of books (list, create, update, delete) and view simple stats by genre.
Swagger/OpenAPI is enabled for API exploration in Development.

## Repository Structure

- Backend/ — .NET 9 minimal API (EF Core + SQLite)
- frontend/ — React + TypeScript app (Vite or similar dev server)
- docs/ — Documentation (e.g., tasks checklist)

## Prerequisites

- .NET SDK 9.0+
- Node.js 18+ (20+ recommended) and npm (or pnpm/yarn)

Optional but useful:

- A REST client (curl, Postman) to try the API.

## Backend: Setup and Run

1. Navigate to the Backend folder:
    - cd Backend
2. Restore and build:
    - dotnet restore
    - dotnet build
3. Apply EF Core migrations (first time and whenever the model changes):
    - If needed, install EF CLI: dotnet tool install --global dotnet-ef
    - Add initial migration (already included in repo as InitialCreate): dotnet ef migrations list
    - Create/Update the database: dotnet ef database update
   Notes:
    - The app also calls Database.Migrate() on startup to apply pending migrations automatically.
    - SQLite files are configured via appsettings.{Environment}.json (book.db, book.dev.db by default).
4. Run the API:
    - dotnet run

By default, in Development the app enables Swagger UI. Look for console output indicating the listening URLs, typically
something like:

- https://localhost:7xxx
- http://localhost:5xxx

Swagger UI (Development only):

- It is configured at the root route when running in Development and uses the v1 endpoint at /swagger/v1/swagger.json.
  If you don’t see it at the root, try /swagger.

API Endpoints (examples):

- GET /api/books — list all books
- GET /api/books/{id} — get a book by id
- POST /api/books — create a book
- PUT /api/books/{id} — update a book
- DELETE /api/books/{id} — delete a book
- GET /api/books/stats — counts of books grouped by genre

Database

- Connection string and seeding are configurable via appsettings.{Environment}.json.
    - Backend/appsettings.json defines defaults. Backend/appsettings.Development.json overrides for Development.
    - ConnectionStrings:Default (SQLite) example: "Data Source=book.db" (relative to working directory).
    - Seeding:Enabled (bool) toggles initial data creation; Seeding:Count controls number of demo books.
- On first run, if seeding is enabled and the DB is empty, the API seeds demo books.

Run Backend Tests

- From Backend/ run: dotnet test

CORS

- CORS is configured via configuration, not hardcoded. In Backend/appsettings.Development.json, set Cors:AllowedOrigins
  to a list of allowed frontend origins, e.g. ["http://localhost:5173", "http://127.0.0.1:5173"]. For other
  environments, use appsettings.{Environment}.json or environment variables. The API uses the policy named "
  ConfiguredCorsPolicy".
- If you change the frontend port or host, update the allowed origins here instead of editing code.

## Frontend: Setup and Run

1. Navigate to the frontend folder:
    - cd frontend
2. Install dependencies:
    - npm install
3. Start the dev server:
    - npm run dev
4. Open the printed local URL (typically http://localhost:5173).

## Running Full Stack Locally

- Start the backend first (dotnet run in Backend/).
- Start the frontend next (npm run dev in frontend/).
- Ensure the frontend URL (default http://localhost:5173) matches the backend CORS configuration.

## One-command Dev Script

To automatically start both the backend and frontend and link them together (no manual setup) use Python 3.

- python3 scripts/dev.py

Notes:

- The scripts automatically:
    - restore .NET dependencies (dotnet restore) and install frontend deps (npm ci/install on first run),
    - start the backend on http://localhost:5152 (hot reload) and the frontend dev server,
    - set VITE_API_URL for the frontend, pointing at the backend URL.
- To override the backend URL, set env BACKEND_URL (for dev.sh/dev.py/dev.mjs), or pass -BackendUrl in dev.ps1.
- Logs are written under untitled/backend.log and untitled/frontend.log.

## Running Full Stack

- Start the backend on a some service and compy its url
- Update the frontends VITE_API_URL then start up the front end.

## Troubleshooting

Backend

- Port already in use: Stop other services using the port or set ASPNETCORE_URLS to a free port, e.g.:
  ASPNETCORE_URLS=http://localhost:5089 dotnet run
- HTTPS certificate issues: If browser warns about the dev certificate, run: dotnet dev-certs https --trust and restart
  the backend.
- SQLite database location: The DB file is created in the OS temp directory (book.db). Deleting it resets the data.

Frontend

- CORS errors in browser console: Ensure the backend is running and CORS allows the frontend origin (Program.cs policy "
  AllowLocalhost5173"). Update the origin or run the frontend on http://localhost:5173.
- Node or npm version errors: Upgrade Node to 18+ (preferably 20+). Delete node_modules and package-lock.json and
  reinstall if needed.

General

- Build failures after pulling changes: Clean and rebuild (dotnet clean && dotnet build, npm ci). Remove temp DB file if
  model changes cause issues.
- Cannot reach API: Check the backend console for the actual listening URL. Verify firewall and that HTTPS redirection
  isn’t blocking plain-http requests.

## Contributing and License

- See docs/tasks.md for a roadmap of improvements (including CONTRIBUTING.md and LICENSE placeholders to be added).
- Until a LICENSE is added, treat this repository as "All rights reserved" by default.

## Design decisions and trade-offs

- Backend: .NET 9 Minimal API for simplicity and fast startup; endpoints organized via a mapper class to keep Program.cs small.
- Database: SQLite chosen for local dev simplicity; migrations are included and applied automatically at startup (Database.Migrate). Trade-off: not ideal for high concurrency; swap connection string for server DB in production.
- Seeding: Configurable via appsettings (Enabled/Count) to provide demo data; avoided heavy seed logic. Trade-off: random data is not deterministic; tests should disable seeding.
- CORS: Configured via appsettings per environment instead of hardcoding. Easier portability between hosts.
- Frontend: React + Vite + React Query for server state; environment variable VITE_API_URL is used to point at the backend.
- Swagger: Enabled only in Development to avoid exposing in production without auth.

## Acknowledgements

- Built with .NET 9 Minimal API, EF Core, SQLite, React, and TypeScript.
