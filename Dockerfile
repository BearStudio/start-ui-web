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
RUN pnpm install --frozen-lockfile --prod=false

# copy source
COPY . .

# build .output
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN pnpm build


# Stage 2: runtime
FROM node:22-alpine AS runtime


WORKDIR /app

# install pnpm
RUN npm install -g pnpm
RUN npm install -g npm-run-all


## copy output build and package.json from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/features/build-info/build-info.gen.json ./src/features/build-info/build-info.gen.json
COPY --from=builder /app/src/features/build-info/script-to-generate-json.ts ./src/features/build-info/script-to-generate-json.ts

# install only production dependencies


RUN pnpm install --prod

ENV NODE_ENV=production

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# start
CMD ["pnpm", "start"]
