FROM node:20-slim

WORKDIR /usr/src/app

COPY . .

RUN apt-get update -y && apt-get install -y openssl && apt-get clean
RUN corepack enable
RUN pnpm install

CMD [ "pnpm", "db:init" ]
