# Simpler Book Library Application

A minimal full‑stack example consisting of:

- Backend: .NET 9 Minimal API with Entity Framework Core and SQLite (SQLite file paths configured via appsettings).
- Frontend: React + TypeScript single‑page app.

The application lets you manage a small library of books (list, create, update, delete) and view simple stats by genre.
Swagger/OpenAPI is enabled for API exploration in Development.

## Repository Structure

- Backend/ — .NET 9 minimal API (EF Core + SQLite)
- frontend/ — React + TypeScript app (Vite or similar dev server)
- 

## Prerequisites

- .NET SDK 9.0+
- Node.js 18+ (20+ recommended) and npm (or pnpm/yarn)
- Vite (bundler/dev server). It is already included as a devDependency and runs via npm scripts (no global install
  required). Optionally install globally: npm i -g vite.

Optional but useful:

- A REST client (curl, Postman) to try the API.

## Backend: Setup and Run

1. Navigate to the Backend folder:
    - cd Backend
2. Restore and build:
    - dotnet restore
    - dotnet build
3. If the frontend is running on the same device, update the "Cors:AllowedOrigins" with the valid url
4. Apply EF Core migrations (first time and whenever the model changes):
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

#### Swagger UI (Development only):

- When running in Development, Swagger UI is served at the root URL ("/") and uses the v1 endpoint at
  /swagger/v1/swagger.json. If you don’t see it at the root, try /swagger.

#### API Endpoints (examples):

- GET /api/books — list all books
- GET /api/books/{id} — get a book by id
- POST /api/books — create a book
- PUT /api/books/{id} — update a book
- DELETE /api/books/{id} — delete a book
- GET /api/books/stats — counts of books grouped by genre

#### Database

- Connection string and seeding are configurable via appsettings.{Environment}.json.
    - Backend/appsettings.json defines defaults. Backend/appsettings.Development.json overrides for Development.
    - ConnectionStrings:Default (SQLite) example: "Data Source=book.db" (relative to working directory).
    - Seeding:Enabled (bool) toggles initial data creation; Seeding:Count controls number of demo books.
- On first run, if seeding is enabled and the DB is empty, the API seeds demo books.

#### Run Backend Tests

- From Backend/ run: dotnet test

#### CORS

This is only necessary if the frontend and backend are running on the same device.

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
3. Configure the API base URL (required):
    - Copy .env.example to .env and adjust VITE_API_URL to point to your backend.
    - Alternatively, set it inline when starting: VITE_API_URL=http://localhost:5152 npm run dev
4. Start the dev server:
    - npm run dev
5. Open the printed local URL (typically http://localhost:5173).

## Running Full Stack Locally

- Start the backend first (dotnet run in Backend/).
- Start the frontend next (npm run dev in frontend/).
- Ensure the frontend URL (default http://localhost:5173) matches the backend CORS configuration.

## Running Full Stack

- Deploy or start the backend somewhere (copy its URL).
- Configure the frontend by setting VITE_API_URL to the backend URL (e.g., update frontend/.env), then start/build the
  frontend.

## Troubleshooting

Backend

- Port already in use: Stop other services using the port or set ASPNETCORE_URLS to a free port, e.g.:
  ASPNETCORE_URLS=http://localhost:5089 dotnet run
- HTTPS certificate issues: If browser warns about the dev certificate, run: dotnet dev-certs https --trust and restart
  the backend.
- SQLite database location: Configured via appsettings.{Environment}.json (Data Source=book.db or book.dev.db by
  default, placed in the working directory). Deleting the file resets the data.

Frontend

- CORS errors in browser console: Ensure the backend is running and CORS allows the frontend origin (Program.cs policy "
  ConfiguredCorsPolicy"). Update the origin or run the frontend on http://localhost:5173.
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

I generally shy away from DTOs since I find for small projects like these, they don't buy anything.

### Backend

For the backend, I chose to stick to .NET 9 minimal API because I didn't need all the bells and whistles of a
controller-based API. The only thing a controller would have bought me was not having to write "/api/books", but the AI
tools I used showed that grouping endpoints under a separate static class and exposing an extension method on
WebApplication provides similar convenience.

I chose to use records to have a mostly immutable data structure, with Id left mutable since it may occasionally need to
be set.

### Database

I chose SQLite since it minimizes dependencies while still being high performance. While not ideal for high concurrency,
it works well for this use case. For my version it only accepts one user; even with more users, for data this small a
simple write queue could be sufficient.

### CORS

To make it easier for the frontend and backend to communicate (especially on the same device),
I've enabled CORS for the backend to allow calls from configured origins.
I've also implemented an environment variable for the frontend (VITE_API_URL) so it can call the API regardless of the
backend URL.

### Frontend

React + Vite + React Query for server state; environment variable VITE_API_URL is used to point at the backend.

## Acknowledgements

- Built with .NET 9 Minimal API, EF Core, SQLite, React, and TypeScript.
