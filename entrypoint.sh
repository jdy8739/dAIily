#!/bin/sh
set -e

echo "Waiting for database..."
sleep 5

echo "Running migrations..."
npx prisma db push --skip-generate

echo "Starting application..."
exec npm start