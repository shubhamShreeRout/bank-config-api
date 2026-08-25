# Bank Service Configuration API

A production-oriented NestJS REST API that stores extensible per-bank service configuration in PostgreSQL JSONB. The logical identifier is `bankCode + serviceName`; adding a service never requires another table or endpoint.

## Stack and architecture

NestJS, TypeScript, PostgreSQL, Prisma, Redis (optional), JWT/RBAC, Pino, Swagger, Jest, Docker, ESLint and Prettier. Requests flow Controller → Service → Repository → Prisma. `banks` has a one-to-many relationship with `service_configurations`; each configuration has a unique `(bankId, serviceName)`, JSONB body, version, and `configuration_history` audit trail.

Supported services are `login`, `dashboard`, `top-nav`, `left-nav`, `device-delivery-status`, and `device-mapping`. Add a service by extending `src/configurations/supported-services.ts` and its validation in `config-validator.service.ts`; no schema changes are required.

## Run locally

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Or start all dependencies with `docker compose up --build`. Prisma production migrations run with `npm run prisma:deploy`. Swagger is at `/api/docs`; health is at `/health`.

Required variables: `DATABASE_URL`, `JWT_SECRET` (32+ chars); optional `REDIS_URL`, `PORT`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `SWAGGER_ENABLED`. Secrets are never committed; use `.env` or deployment secret management.


## Authentication

Writes require a Bearer JWT with `roles`: `ADMIN` or `CONFIG_MANAGER`. `ADMIN` creates banks; `READ_ONLY` is intentionally read-only. GET routes are currently public for consumer integration; place an API-key guard in front of those routes when a client API-key scheme is introduced.

## API

- `POST /api/v1/banks` — create a bank (ADMIN)
- `POST /api/v1/configurations` — create/update configuration (ADMIN, CONFIG_MANAGER)
- `DELETE /api/v1/configurations/:bankCode/:serviceName` — soft-delete configuration (ADMIN)
- `GET /api/v1/configurations/:bankCode/:serviceName` — fetch a configuration
- `GET /api/v1/configurations/:bankCode` — fetch all active configurations
- `GET /health` — API/Postgres/Redis status

```bash
curl -X POST http://localhost:3000/api/v1/configurations \
  -H 'Content-Type: application/json' -H 'Authorization: Bearer TOKEN' \
  -d '{"bankCode":"BANK001","serviceName":"top-nav","config":{"imageUrl":"https://example.com/logo.png","theme":{"primary":"#123456","secondary":"#FFFFFF"}}}'

curl http://localhost:3000/api/v1/configurations/BANK001/top-nav
```

Responses use `{ "success": true, "data": {}, "meta": {} }`; errors use `{ "success": false, "error": { "code": "...", "message": "..." } }`. Updates are transactional: they increment `version`, add an audit entry with prior/new JSONB values, and invalidate `config:{bankCode}:{serviceName}`. Redis errors are tolerated and reads fall back to PostgreSQL.

Deletion is a soft delete: the configuration becomes inactive, its version increments, the cache is invalidated, and a `DELETE` audit-history record preserves the previous JSONB document.

## Quality checks

```bash
npm run lint:check
npm test
npm run build
docker compose up --build
```

Seed data creates `BANK001` and `BANK002`, each with all supported configurations.
