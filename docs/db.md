# Database Specification

## Overview

Database: PostgreSQL
ORM: Prisma

## Schema Location

`/prisma/schema.prisma`

## Prisma Commands

### Setup & Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only - WARNING: deletes all data)
npx prisma migrate reset
```

### Prisma Studio

```bash
# Start Prisma Studio (database GUI)
npx prisma studio
```

- Access at: http://localhost:5555
- Connects directly to your database via `.env` connection string

### Troubleshooting

If Prisma client is corrupted:

```bash
# 1. Clean npm cache
npm cache clean --force

# 2. Remove corrupted Prisma files
rm -rf node_modules/.prisma && rm -rf node_modules/prisma

# 3. Reinstall dependencies
npm install

# 4. Regenerate Prisma client
npx prisma generate
```

### Stop Services

```bash
pkill -f "prisma studio"
```

## Models

<!-- Add your database models and specifications here -->

## Relationships

<!-- Document entity relationships here -->

## Indexes & Performance

<!-- Document indexes and performance considerations here -->

## Migration Guidelines

<!-- Document migration best practices here -->
