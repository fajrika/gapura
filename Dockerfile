# syntax=docker/dockerfile:1

# ---------- stage: deps ----------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- stage: builder ----------
FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_VAPID_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_VAPID_KEY=$NEXT_PUBLIC_VAPID_KEY \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- stage: runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# font DejaVu untuk cetak PDF surat (paket Alpine)
RUN apk add --no-cache ttf-dejavu

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/migrate.mjs ./migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# drizzle-orm & postgres di-bundle ke chunk saat build, tapi dibutuhkan
# sebagai paket nyata oleh migrate.mjs -> salin dari stage deps (pure JS).
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
