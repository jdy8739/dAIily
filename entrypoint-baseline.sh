#!/bin/sh
set -e

echo "Waiting for database..."
sleep 5

echo "Syncing schema with db push..."
npx prisma db push --skip-generate

echo "Baselining migrations..."
for migration in $(ls prisma/migrations/ | grep -v migration_lock); do
  echo "Marking $migration as applied..."
  npx prisma migrate resolve --applied "$migration" || true
done

echo "Starting application..."
exec npm start
