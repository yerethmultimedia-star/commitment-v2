# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
RUN apk add --no-cache python3 make g++

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=@commitment/shared run build
RUN pnpm --filter=@commitment/domain run build
RUN pnpm --filter=backend run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

CMD ["node", "apps/backend/dist/main.js"]
