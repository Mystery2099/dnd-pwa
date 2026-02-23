# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential curl && rm -rf /var/lib/apt/lists/*

# Copy workspace config
COPY package.json bun.lock ./
COPY grimar/package.json ./grimar/
COPY grimar/bun.lock ./grimar/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY grimar ./grimar

# Build
WORKDIR /app/grimar
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runtime

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /app/grimar/build ./build
COPY --from=builder /app/grimar/package.json ./
COPY --from=builder /app/grimar/node_modules ./node_modules

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATABASE_URL=/app/data/grimar.db

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Run the server
CMD ["bun", "./build/index.js"]
