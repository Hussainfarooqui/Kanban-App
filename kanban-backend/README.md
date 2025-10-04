# Kanban Backend — Local Docker Setup

This README covers running the backend and Postgres locally using Docker on Windows (PowerShell). It also includes quick non-Docker fallbacks.

Prerequisites
- Docker Desktop for Windows (recommended). Install from https://www.docker.com/get-started and enable WSL2 if prompted.
- Node.js (for non-Docker runs) and npm installed.

Quick checks
```powershell
# Check docker availability
docker --version
docker compose version

# (Optional) check docker-compose standalone
docker-compose --version
```

Start the full stack (Docker)
```powershell
cd 'e:\FullStack Dev\project\kanban-backend'

# Start Postgres (detached)
npm run compose:up

# Wait for Postgres then push prisma schema and seed
npm run db:prepare

# Start backend (dev) - runs in this shell
npm run dev

# OR run the combined flow which brings up compose, prepares DB, then runs dev
# npm run dev:docker
```

Build production image
```powershell
cd 'e:\FullStack Dev\project\kanban-backend'
# Build the production image using Dockerfile.prod
docker build -f Dockerfile.prod -t kanban-backend:prod .
```

Run production image (example pointing to host Postgres)
```powershell
docker run --rm -e DATABASE_URL="postgresql://postgres:admin12@host.docker.internal:5432/kanban_db?schema=public" -e JWT_SECRET="super-secret-jwt-key" -p 3000:3000 kanban-backend:prod
```

Troubleshooting
- "docker: not recognized" — Docker Desktop not installed or not in PATH. Install Docker Desktop and restart your terminal.
- "docker compose" vs "docker-compose" — Docker Desktop usually provides `docker compose` (v2). The repo scripts use `docker-compose` where appropriate but `docker compose` is preferred. You can run `docker compose` commands directly if `docker-compose` isn't on PATH.
- If `npm run db:prepare` times out waiting for Postgres, ensure the `db` container is healthy (`docker ps` and `docker logs <db_container>`).

Non-Docker (quick local dev fallback)
```powershell
cd 'e:\FullStack Dev\project\kanban-backend'
# 1) Ensure .env has DATABASE_URL pointing at local Postgres or use SQLite (change prisma/schema.prisma)
# 2) Install deps
npm install
# 3) Generate prisma client & seed (if using Postgres ensure DB exists)
npx prisma generate
npx prisma db push
npm run prisma:seed # or npx prisma db seed
# 4) Run dev server
npm run dev
```

Notes
- The compose stack maps Postgres to host port 5432. If you have a local Postgres already running on 5432, either stop it or change the compose port mapping.
- For production deployments, switch from `prisma db push` to `prisma migrate` and use a secure secret store for `JWT_SECRET`.