# Monorepo-aware production image — build context: repository root
# docker build -f backend/Dockerfile -t rezerva-backend .

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY backend/package.json backend/
COPY packages/shared-constants/package.json packages/shared-constants/
COPY packages/shared-validation/package.json packages/shared-validation/
COPY packages/tsconfig packages/tsconfig
COPY packages/eslint-config packages/eslint-config
COPY packages/shared-constants/src packages/shared-constants/src
COPY packages/shared-constants/tsconfig.json packages/shared-constants/
COPY packages/shared-validation/src packages/shared-validation/src
COPY packages/shared-validation/tsconfig.json packages/shared-validation/
COPY backend/prisma backend/prisma
COPY backend/src backend/src
COPY backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json backend/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @rezerva/shared-constants build \
 && pnpm --filter @rezerva/shared-validation build \
 && pnpm --filter backend exec prisma generate \
 && pnpm --filter backend build

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache wget \
 && addgroup -S nodejs \
 && adduser -S nestjs -G nodejs
WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/packages ./packages

USER nestjs
WORKDIR /app/backend
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
