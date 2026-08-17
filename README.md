# Help Desk API

Backend API for support ticket management, with JWT authentication, RBAC, comments, change history, dashboard metrics, data validation, pagination, structured logs, OpenAPI documentation, and tests.

## Overview

The project is built around domain-oriented organization and a clear separation between:

- controllers
- services
- schemas
- middlewares
- standardized errors
- API documentation
- unit and integration tests

## Technologies

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- JWT
- Zod
- Jest
- Supertest
- Swagger / OpenAPI
- Docker
- GitHub Actions

## Features

- User registration and login
- Role-based access control
- Users CRUD
- Categories CRUD
- Priorities CRUD
- Tickets CRUD
- Ticket assignment and unassignment
- Status updates
- Ticket comments
- Change history
- Dashboard metrics
- Pagination, filtering, and sorting in list endpoints
- Global error handling
- Structured logs
- OpenAPI documentation
- Unit and integration tests

## Project Structure

```text
src/
  app.ts
  server.ts
  docs/
  routes/
  shared/
  modules/
    auth/
    users/
    categories/
    priorities/
    tickets/
    dashboard/
```

Each module follows the same pattern:

- `controller` for HTTP entry points
- `service` for business rules
- `schemas` for Zod validation
- `routes` for endpoint exposure

## Requirements

- Node.js 20 or newer
- PostgreSQL

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
POSTGRES_USER=example
POSTGRES_PASSWORD=example123
POSTGRES_DB=example_db
POSTGRES_PORT=5432
DATABASE_URL="postgresql://example:example123@localhost:5432/example_db?schema=public"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN_SECONDS=3600
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL with Docker:

```bash
docker compose up -d
```

3. Generate the Prisma Client:

```bash
npm run prisma:generate
```

4. Apply migrations:

```bash
npm run prisma:migrate
```

5. Start the app in development mode:

```bash
npm run dev
```

## Scripts

- `npm run dev` - starts the app in development mode
- `npm run build` - compiles the project
- `npm run start` - starts the compiled app
- `npm test` - runs the test suite
- `npm run format` - formats the codebase
- `npm run format:check` - checks formatting without changing files
- `npm run prisma:generate` - generates the Prisma Client
- `npm run prisma:migrate` - runs Prisma migrations
- `npm run prisma:studio` - opens Prisma Studio

## Docker

The project includes a `docker-compose.yml` file for PostgreSQL only.

Start the database:

```bash
docker compose up -d
```

Stop the database:

```bash
docker compose down
```

## API

Local base URL:

```text
http://localhost:3000/api/v1
```

Main endpoints:

- `GET /api/v1/health`
- `GET /api/v1/docs`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users`
- `PATCH /api/v1/users/:userId`
- `DELETE /api/v1/users/:userId`
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `GET /api/v1/categories/:categoryId`
- `PATCH /api/v1/categories/:categoryId`
- `DELETE /api/v1/categories/:categoryId`
- `GET /api/v1/priorities`
- `POST /api/v1/priorities`
- `GET /api/v1/priorities/:priorityId`
- `PATCH /api/v1/priorities/:priorityId`
- `DELETE /api/v1/priorities/:priorityId`
- `GET /api/v1/tickets`
- `POST /api/v1/tickets`
- `PATCH /api/v1/tickets/:ticketId/assign`
- `PATCH /api/v1/tickets/:ticketId/unassign`
- `PATCH /api/v1/tickets/:ticketId/status`
- `POST /api/v1/tickets/:ticketId/comments`
- `GET /api/v1/dashboard`
- `GET /api/v1/dashboard/status`
- `GET /api/v1/dashboard/priorities`
- `GET /api/v1/dashboard/period`

## Error Responses

Errors follow a standardized structure:

```json
{
  "error": {
    "category": "validation",
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

Possible categories:

- `validation`
- `auth`
- `business`
- `internal`

## OpenAPI Documentation

Interactive documentation:

```text
GET /api/v1/docs
```

OpenAPI JSON specification:

```text
GET /api/v1/docs/openapi.json
```

## Tests

The project includes:

- unit tests for services and middlewares
- integration tests with Supertest

Run the suite:

```bash
npm test -- --runInBand
```

## Architecture

The application follows a domain-oriented modular architecture:

- `shared/` contains reusable code
- `modules/` separates each business domain
- business rules live in services
- validation lives in Zod schemas
- Express is responsible only for HTTP transport

## License

MIT
