# syntax=docker/dockerfile:1

ARG NODE_VERSION=24

# ------------------------------------------------------------------------------
# Base: official pnpm image. pnpm manages the Node runtime itself, so the Node
# version is pinned once here and reused by every stage (including the runner).
# ------------------------------------------------------------------------------
FROM ghcr.io/pnpm/pnpm:12 AS base

ARG NODE_VERSION
# `node` on the PATH is a pnpm shim, so we also export the real binary to a
# stable path for the runner stage (which has no pnpm).
RUN pnpm runtime set node "${NODE_VERSION}" -g -y \
  && install -m 755 "$(node -p process.execPath)" /usr/local/bin/node-runtime \
  && /usr/local/bin/node-runtime --version

WORKDIR /app

# ------------------------------------------------------------------------------
# Deps: install dependencies only. This layer is cached as long as the lockfile
# and the Prisma schema do not change.
# ------------------------------------------------------------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma/schema.prisma ./prisma/

# --ignore-scripts skips the postinstall (prisma generate + build info) and the
# prepare (lefthook, needs git). We run what we need explicitly.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts \
  && ./node_modules/.bin/prisma generate --no-hints

# ------------------------------------------------------------------------------
# Builder: compile the app. Only VITE_* values are needed here: they are inlined
# into the client bundle. Server secrets (DATABASE_URL, AUTH_SECRET, ...) are
# NOT build args: they are read at runtime from the container environment.
# ------------------------------------------------------------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/server/db/generated ./src/server/db/generated
COPY . .

ARG VITE_BASE_URL
ARG VITE_S3_BUCKET_PUBLIC_URL
ARG VITE_ENV_NAME
ARG VITE_ENV_EMOJI
ARG VITE_ENV_COLOR
ARG VITE_IS_DEMO

# Server env validation is skipped here and runs when the server starts.
ENV NODE_ENV=production \
  SKIP_ENV_VALIDATION=1 \
  NODE_OPTIONS=--max-old-space-size=4096

# Same steps as `pnpm build`, but calling the binaries directly: pnpm would
# otherwise try to re-run the install lifecycle (postinstall/prepare) because
# node_modules was installed with --ignore-scripts.
RUN node ./run-jiti ./src/features/build-info/script-to-generate-json.ts \
  && ./node_modules/.bin/vite build

# ------------------------------------------------------------------------------
# Runner: minimal runtime image. Same Debian release and glibc as the builder
# (required by the Prisma engine binaries), with the exact Node binary that
# built the app. Nitro traces the server dependencies it needs into
# .output/server/node_modules, so the full node_modules is not required.
# ------------------------------------------------------------------------------
FROM debian:trixie-slim AS runner

ENV NODE_ENV=production \
  HOST=0.0.0.0 \
  PORT=3000

RUN groupadd --system --gid 1001 node \
  && useradd --system --uid 1001 --gid node --home-dir /app --shell /usr/sbin/nologin node

WORKDIR /app

COPY --from=base /usr/local/bin/node-runtime /usr/local/bin/node
COPY --from=builder --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

# Liveness check on a static asset: it is served by Nitro without going through
# the app router, so it does not depend on the auth host allowlist or the DB.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/favicon.ico').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
