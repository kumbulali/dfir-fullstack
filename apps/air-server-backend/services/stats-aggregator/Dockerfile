FROM node:22.17.0-alpine
WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN npm install -g pnpm

COPY services/stats-aggregator services/stats-aggregator
COPY libs libs

RUN pnpm install -r
RUN pnpm run build stats-aggregator