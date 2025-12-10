# Builder Stage
FROM node:22-alpine AS builder

WORKDIR /app

# install tools
RUN npm install -g pnpm

# copy files needed for installing dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma/schema.prisma ./prisma/
COPY run-jiti.js ./
COPY src/features/build-info/script-to-generate-json.ts ./src/features/build-info/

# install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm postinstall

ARG VITE_BASE_URL
ARG VITE_ENV_NAME
ARG VITE_ENV_EMOJI
ARG VITE_ENV_COLOR
ARG VITE_IS_DEMO
ARG DATABASE_URL
ARG AUTH_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG EMAIL_SERVER
ARG EMAIL_FROM

ENV VITE_BASE_URL=$VITE_BASE_URL \
    VITE_ENV_NAME=$VITE_ENV_NAME \
    VITE_ENV_EMOJI=$VITE_ENV_EMOJI \
    VITE_ENV_COLOR=$VITE_ENV_COLOR \
    VITE_IS_DEMO=$VITE_IS_DEMO \
    DATABASE_URL=$DATABASE_URL \
    AUTH_SECRET=$AUTH_SECRET \
    GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    EMAIL_SERVER=$EMAIL_SERVER \
    EMAIL_FROM=$EMAIL_FROM

# copy source code
COPY . .

# build the application
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN pnpm build


# Runtime Stage
FROM node:22-alpine

WORKDIR /app

# install pnpm
RUN npm install -g pnpm npm-run-all


ARG VITE_BASE_URL
ARG VITE_ENV_NAME
ARG VITE_ENV_EMOJI
ARG VITE_ENV_COLOR
ARG VITE_IS_DEMO
ARG DATABASE_URL
ARG AUTH_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG EMAIL_SERVER
ARG EMAIL_FROM

ENV VITE_BASE_URL=$VITE_BASE_URL \
    VITE_ENV_NAME=$VITE_ENV_NAME \
    VITE_ENV_EMOJI=$VITE_ENV_EMOJI \
    VITE_ENV_COLOR=$VITE_ENV_COLOR \
    VITE_IS_DEMO=$VITE_IS_DEMO \
    DATABASE_URL=$DATABASE_URL \
    AUTH_SECRET=$AUTH_SECRET \
    GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    EMAIL_SERVER=$EMAIL_SERVER \
    EMAIL_FROM=$EMAIL_FROM

## copy output build and package.json from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# start the application
CMD ["pnpm", "start"]
