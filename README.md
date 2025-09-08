# Simpler Book Library Application

A minimal full‑stack example consisting of:
- Backend: .NET 9 Minimal API with Entity Framework Core and SQLite (file stored under the OS temp directory).
- Frontend: React + TypeScript single‑page app.

The application lets you manage a small library of books (list, create, update, delete) and view simple stats by genre. Swagger/OpenAPI is enabled for API exploration in Development.

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
3. Run the API:
   - dotnet run

By default, in Development the app enables Swagger UI. Look for console output indicating the listening URLs, typically something like:
- https://localhost:7xxx
- http://localhost:5xxx

Swagger UI (Development only):
- It is configured at the root route when running in Development and uses the v1 endpoint at /swagger/v1/swagger.json. If you don’t see it at the root, try /swagger.

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
- CORS is configured via configuration, not hardcoded. In Backend/appsettings.Development.json, set Cors:AllowedOrigins to a list of allowed frontend origins, e.g. ["http://localhost:5173", "http://127.0.0.1:5173"]. For other environments, use appsettings.{Environment}.json or environment variables. The API uses the policy named "ConfiguredCorsPolicy".
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

## Running Full Stack
- Start the backend on a some service and compy its url
- Update the frontends VITE_API_URL then start up the front end.

## Troubleshooting

Backend
- Port already in use: Stop other services using the port or set ASPNETCORE_URLS to a free port, e.g.: ASPNETCORE_URLS=http://localhost:5089 dotnet run
- HTTPS certificate issues: If browser warns about the dev certificate, run: dotnet dev-certs https --trust and restart the backend.
- SQLite database location: The DB file is created in the OS temp directory (book.db). Deleting it resets the data.

Frontend
- CORS errors in browser console: Ensure the backend is running and CORS allows the frontend origin (Program.cs policy "AllowLocalhost5173"). Update the origin or run the frontend on http://localhost:5173.
- Node or npm version errors: Upgrade Node to 18+ (preferably 20+). Delete node_modules and package-lock.json and reinstall if needed.

General
- Build failures after pulling changes: Clean and rebuild (dotnet clean && dotnet build, npm ci). Remove temp DB file if model changes cause issues.
- Cannot reach API: Check the backend console for the actual listening URL. Verify firewall and that HTTPS redirection isn’t blocking plain-http requests.

## Contributing and License

- See docs/tasks.md for a roadmap of improvements (including CONTRIBUTING.md and LICENSE placeholders to be added).
- Until a LICENSE is added, treat this repository as "All rights reserved" by default.

## Acknowledgements

- Built with .NET 9 Minimal API, EF Core, SQLite, React, and TypeScript.
