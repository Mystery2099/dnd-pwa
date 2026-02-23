#!/bin/bash
set -e

echo "[startup] Starting Grimar..."

DATABASE_URL="${DATABASE_URL:-/app/data/grimar.db}"
export DATABASE_URL

echo "[startup] Database path: $DATABASE_URL"

DB_DIR=$(dirname "$DATABASE_URL")

if [ ! -d "$DB_DIR" ]; then
    echo "[startup] Creating data directory: $DB_DIR"
    mkdir -p "$DB_DIR"
fi

echo "[startup] Starting server..."
exec bun ./build/index.js
