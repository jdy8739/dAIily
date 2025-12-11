#!/bin/sh
set -e

echo "Waiting for database..."
sleep 5

echo "Creating database backup..."
mkdir -p /app/backups
export PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
pg_dump -h db -U postgres daiily | gzip > "/app/backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz" 2>/dev/null || true
find /app/backups -name "backup_*.sql.gz" -mtime +7 -delete

echo "Running migrations..."
prisma migrate deploy --schema=/app/prisma/schema.prisma

echo "Starting standalone server..."
exec node server.js