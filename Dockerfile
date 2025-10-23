# Stage 1: builder
FROM node:22-alpine AS builder

WORKDIR /app

# install pnpm & git
RUN npm install -g pnpm
RUN apk update && \
    apk upgrade && \
    apk add --no-cache git

RUN git init


# copy lock, package files and configs
COPY package.json pnpm-lock.yaml ./
COPY run-jiti.js ./
COPY src/features/build-info/script-to-generate-json.ts src/features/build-info/build-info.gen.json ./src/features/build-info/
COPY prisma/schema.prisma ./prisma/

RUN pnpm install --frozen-lockfile

# copy source
COPY . .

ENV NODE_OPTIONS=--max-old-space-size=4096

# build app
RUN pnpm build


# Stage 2: runtime
FROM node:22-alpine AS runtime


WORKDIR /app

# ENV
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# install pnpm
RUN npm install -g pnpm npm-run-all

COPY .env ./



## copy output build and package.json from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

EXPOSE 3000

# start
CMD ["pnpm", "start"]
