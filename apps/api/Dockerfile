# ============================================================
# SCHOOLOS API — MULTI-STAGE PRODUCTION DOCKERFILE
# ============================================================

# Stage 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace & API package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/

RUN npm ci --workspace=@schoolos/api

# Copy API source code
COPY apps/api ./apps/api/

# Generate Prisma Client & Build NestJS Dist
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Execution Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

# Copy built application & node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Non-root security user execution
USER node

EXPOSE 3000

# Container Health Check Probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health/live || exit 1

CMD ["node", "apps/api/dist/main"]
