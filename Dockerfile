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

# Environment variables
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    VITE_PORT=3000

# install pnpm
RUN npm install -g pnpm npm-run-all
COPY .env ./

## copy output build and package.json from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# start the application
CMD ["pnpm", "start"]
