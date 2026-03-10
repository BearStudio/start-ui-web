---
name: setup-start-ui-project
description: Set up a new StartUI web project from scratch. Use when the user clones a StartUI repo, creates a new worktree, or needs to initialize a project for the first time. Runs the correct scripts in the correct order to get the project running locally.
---

# Setup StartUI Project

## Workflow

Run these steps in order. Do not skip any.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create `.env`

Copy `.env.example` to `.env`, then:

- Set `DOCKER_DATABASE_NAME` to a unique name derived from the project folder: lowercase, non-alphanumeric characters replaced by underscores.
  Examples: `my-app` → `my_app`, `start-ui-web` → `start_ui_web`, `accra-v2` → `accra_v2`
- Generate a real `AUTH_SECRET`: `npx @better-auth/cli@latest secret`
- Ensure `AUTH_ALLOWED_HOSTS` includes `*.localhost:1355` (already set in `.env.example`) — this allows portless URLs to work with Better Auth

Leave `REPLACE_WITH_*_PORT` placeholders as-is for now — they'll be filled in step 4.

### 3. Start containers and create the database

```bash
pnpm dk:init
```

- Starts shared Docker containers (`startui-shared` project): postgres, minio, maildev
- Creates the project's database inside the shared postgres container
- If containers are already running (another StartUI project is active), this is fast and non-destructive
- Ports are assigned randomly by Docker to avoid conflicts between projects

### 4. Register portless aliases for HTTP services

Portless proxies HTTP services to stable named URLs. Run once — aliases persist across restarts.

```bash
portless alias minio $(docker port startui-shared-minio-1 9000 | cut -d: -f2)
portless alias minio-ui $(docker port startui-shared-minio-1 9001 | cut -d: -f2)
portless alias maildev $(docker port startui-shared-maildev-1 1080 | cut -d: -f2)
```

After this, these URLs are stable regardless of Docker port changes:
- MinIO S3 API: `http://minio.localhost:1355` (already set as `S3_HOST` in `.env`)
- MinIO UI: `http://minio-ui.localhost:1355`
- MailDev UI: `http://maildev.localhost:1355`

### 5. Update `.env` with TCP ports

Portless cannot proxy TCP services (postgres, SMTP). Query their actual Docker ports:

```bash
docker port startui-shared-postgres-1 5432   # → DATABASE_URL port
docker port startui-shared-maildev-1 1025    # → EMAIL_SERVER port
```

Each command outputs `127.0.0.1:<port>`. Update `.env`:
- `DATABASE_URL`: replace `REPLACE_WITH_DB_PORT` with the postgres port
- `EMAIL_SERVER`: replace `REPLACE_WITH_SMTP_PORT` with the maildev SMTP port

### 6. Apply schema and seed data

```bash
pnpm db:init
```

Only run on a fresh/empty database.

### 7. Start the dev server

```bash
pnpm dev
```

The dev server runs via **portless** — it auto-assigns a random port and proxies it to a stable named URL:

```
http://<folder-name>.localhost:1355
```

No port conflicts between worktrees or projects.

---

## Daily Usage (existing project)

```bash
pnpm dk:start   # resume containers after a reboot
pnpm dev        # start the app — portless URL is logged on startup
```

Note: Docker ports do not change between `dk:stop` / `dk:start` — only after `dk:clear`.

## Reset Everything

```bash
pnpm dk:clear        # remove containers + volumes (data loss!)
pnpm dk:init         # recreate containers and database
# Re-run steps 4 and 5: re-register portless aliases and update TCP ports in .env
pnpm db:init         # reapply schema and seed
```

## Architecture

| Service | Protocol | Access |
|---|---|---|
| PostgreSQL | TCP | `localhost:<docker-port>` (dynamic, in `.env`) |
| MinIO S3 API | HTTP | `minio.localhost:1355` (portless alias, stable) |
| MinIO UI | HTTP | `minio-ui.localhost:1355` (portless alias, stable) |
| MailDev SMTP | TCP | `localhost:<docker-port>` (dynamic, in `.env`) |
| MailDev UI | HTTP | `maildev.localhost:1355` (portless alias, stable) |
| Dev server | HTTP | `<folder-name>.localhost:1355` (portless, auto-named) |
