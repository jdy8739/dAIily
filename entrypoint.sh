#!/bin/sh
set -e

echo "Waiting for database..."
sleep 5

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting standalone server..."
exec node server.js