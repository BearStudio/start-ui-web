
# Builder Stage
FROM node:22-alpine AS builder

WORKDIR /app

# install tools
RUN npm install -g pnpm && \
    apk add --no-cache git && \
    git init

# copy files needed for installing dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma/schema.prisma ./prisma/
COPY run-jiti.js ./
COPY src/features/build-info/script-to-generate-json.ts ./src/features/build-info/

# install dependencies
RUN pnpm install --frozen-lockfile

# copy source code
COPY . .

# build the application
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN pnpm build


# Runtime Stage
FROM node:22-alpine

WORKDIR /app

# Environnement variables
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

# install tools
RUN npm install -g pnpm npm-run-all && \
    apk add --no-cache git && \
    git init

# copy files needed for installing dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/run-jiti.js ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/features/build-info ./src/features/build-info

# copy environment configuration
# TODO: Replace with environment variables or secrets in production
COPY .env ./

# install production dependencies (this will run prisma generate)
RUN pnpm install --frozen-lockfile

# copy build artifacts after installation
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# start the application
CMD ["pnpm", "start"]
