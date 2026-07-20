#!/bin/sh
# Runs pending Prisma migrations before the API starts accepting traffic.
set -e

echo "[entrypoint] Applying database migrations..."
node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Starting Pablo AI Social Agent API..."
exec "$@"
