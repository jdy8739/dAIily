#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
sleep 10

# Run database migrations
echo "Running database migrations..."
npx prisma db push

# Start the application
echo "Starting application..."
node server.js