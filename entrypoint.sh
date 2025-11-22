#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
sleep 10

# Run database migrations using the generated Prisma client
echo "Running database migrations..."
if [ -f "./node_modules/.bin/prisma" ]; then
  ./node_modules/.bin/prisma db push --skip-generate
else
  echo "Warning: Prisma CLI not found, skipping migrations"
fi

# Start the application
echo "Starting application..."
exec node server.js