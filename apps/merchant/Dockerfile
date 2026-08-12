FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat vips
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/commerce/package.json ./packages/commerce/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/compiler/package.json ./packages/compiler/
COPY packages/runtime/package.json ./packages/runtime/
COPY apps/merchant/package.json ./apps/merchant/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1`nENV SKIP_ENV_VALIDATION=1
RUN pnpm --filter @corecart/database build
RUN pnpm --filter merchant build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1`nENV SKIP_ENV_VALIDATION=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/merchant/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/merchant/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/merchant/.next/static ./apps/merchant/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/merchant/server.js"]
