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

# Generate and push database schema (run migrations)
WORKDIR /app/grimar
ENV DATABASE_URL=/app/grimar/data/grimar.db
RUN mkdir -p /app/grimar/data && bun run db:push

# Build
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runtime

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/grimar/package.json ./grimar/
COPY --from=builder /app/bun.lock ./

# Install dependencies
RUN bun install

# Copy built application
COPY --from=builder /app/grimar/build ./build

# Copy initialized database from builder
COPY --from=builder /app/grimar/data ./data

# Copy startup script
COPY grimar/scripts/docker-start.sh ./docker-start.sh

# Create data directory (in case of fresh start)
RUN mkdir -p /app/data

# Environment defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATABASE_URL=/app/data/grimar.db

# Expose port
EXPOSE 3000

# Run the startup script (handles DB init + starts server)
CMD ["sh", "./docker-start.sh"]
