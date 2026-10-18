# ========================================================
# Production Multi-Stage Dockerfile for «الفرص — Al-Foras»
# Optimized for Google Cloud Run, AWS ECS, and Docker
# ========================================================

# Stage 1: Build & Bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package manifests first for optimal Docker layer caching
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy full application source
COPY . .

# Build client SPA and bundle server
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime security packages
RUN apk add --no-cache curl tzdata

# Create unprivileged application user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Copy package files and production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled assets from builder
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/public ./public
COPY --from=builder --chown=appuser:nodejs /app/firebase-applet-config.json ./firebase-applet-config.json

# Copy server assets and data directories
COPY --from=builder --chown=appuser:nodejs /app/server ./server
COPY --from=builder --chown=appuser:nodejs /app/data ./data

# Switch to non-root user
USER appuser

# Expose standard application port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start bundled Node.js server
CMD ["node", "dist/server.cjs"]
