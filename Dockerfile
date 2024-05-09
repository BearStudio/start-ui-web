FROM node:20-alpine AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache git
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Enable supported package managers
RUN corepack enable
WORKDIR /app
COPY . .

FROM base AS build
# We still need devDependencies to build Start UI [web], so no --prod option
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Building as a production application though
ENV NODE_ENV production
RUN pnpm run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next

USER nextjs
WORKDIR /app

EXPOSE 3000

ENV PORT 3000

# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["pnpm", "start"]
