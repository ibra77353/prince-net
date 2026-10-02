# Prince Net Management System — Base44 Dev Notes

## Overview

pnpm monorepo: NestJS + Prisma API (`apps/api`) and React + Vite web (`apps/web`), with shared packages (`packages/types`, `packages/validation`, `packages/config`). PostgreSQL database. Arabic RTL UI.

## Setup

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Services: `db` (Postgres 15), `setup` (installs deps + builds packages + generates Prisma client), `migrate` (runs migrations + seed), `api` (NestJS watch mode), `web` (Vite dev on port 5173, mapped to host 3000).

## Key Details

- **Node version**: pnpm 11.28.0 requires Node ≥ 22. Dockerfile uses `node:22`.
- **Shared packages** (`packages/*`) must be built before the API can compile — `setup` service runs `pnpm -r --filter './packages/*' build`.
- **Prisma client** is generated to `apps/api/src/generated/prisma/` — `setup` service runs `prisma:generate`.
- **Single-origin wiring**: Vite proxies `/api` → `http://api:3000` (configurable via `API_PROXY_TARGET` env var in `vite.config.ts`). Auth uses HttpOnly cookies + CSRF, so same-origin is required.
- **Secrets**: `JWT_SECRET` and `CSRF_SECRET` are required at boot, delivered via `/run/base44/app.env`. Development placeholders are auto-generated.
- **Admin credentials** (seed only): `ADMIN_EMAIL=admin@prince-net.local`, `ADMIN_PASSWORD=ChangeMeStrongPassword123` — set in `.env.base44-defaults`.
- **Missing backups module**: The repo was imported without `apps/api/src/backups/`. It was created during setup with full backup/restore logic (advisory locks, gzip, SHA-256 checksum, all 17 tables).
- **Vite config changes**: `allowedHosts: true` and `watch.usePolling: true` added for Docker bind-mount compatibility. Proxy target made configurable via `API_PROXY_TARGET`.

## Verifying

```bash
# Web on port 3000
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/  # → 200

# API via Vite proxy
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/auth/csrf  # → 200

# Container health
docker compose -f docker-compose.base44.yml ps  # all should be healthy
```

## Development

- Frontend edits hot-reload via Vite.
- Backend edits hot-reload via `nest start --watch` (with `CHOKIDAR_USEPOLLING=true` for bind mounts).
- After changing dependencies or Prisma schema, re-run `docker compose -f docker-compose.base44.yml up -d --build`.
