FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN apk upgrade --update-cache --available && \
  apk add openssl && \
  rm -rf /var/cache/apk/*
RUN corepack enable
RUN pnpm install

CMD [ "pnpm", "db:init" ]
