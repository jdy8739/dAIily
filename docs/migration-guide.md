# Safe Database Migration Guide

## Problem

Using `prisma db push` in production can cause data loss when making schema changes.

## Solution

Use Prisma migrations with automatic backups.

## Before Deploying Schema Changes

### 1. Create Migration Locally

```bash
# Generate migration files from schema changes
npx prisma migrate dev --name describe_your_changes

# Example: npx prisma migrate dev --name add_user_bio_field
```

This creates a migration file in `prisma/migrations/` that you'll commit to git.

### 2. Test Migration Locally

```bash
# Reset database and apply all migrations
npx prisma migrate reset

# Or just apply pending migrations
npx prisma migrate deploy
```

### 3. Commit Migration Files

```bash
git add prisma/migrations/
git commit -m "feat: add user bio field migration"
git push
```

## Deploying to Production

### Option A: Automated Safe Migration (Recommended)

```bash
# On server, pull latest code
git pull

# Run safe migration script (auto-backup + migrate)
chmod +x scripts/safe-migrate.sh
./scripts/safe-migrate.sh
```

The script will:
1. Backup database to `./backups/backup_TIMESTAMP.sql`
2. Apply migrations with `prisma migrate deploy`
3. Restart app container

### Option B: Manual Migration

```bash
# 1. Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backup_$(date +%Y%m%d).sql

# 2. Apply migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 3. Restart app
docker-compose -f docker-compose.prod.yml restart app
```

## Rollback if Needed

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < backups/backup_20241201_143022.sql

# Restart app
docker-compose -f docker-compose.prod.yml restart app
```

## Migration Commands Reference

| Command | Use Case |
|---------|----------|
| `npx prisma migrate dev` | Create new migration (development) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma migrate status` | Check pending migrations |
| `npx prisma migrate reset` | Reset DB and reapply all migrations (dev only) |
| `npx prisma db push` | Sync schema without migrations (dev only, risky) |

## Important Notes

- **Never use `db push` in production** - it doesn't track changes and can lose data
- **Always backup before migrations** - use the safe-migrate.sh script
- **Test migrations locally first** - use `migrate dev` and `migrate reset`
- **Commit migration files** - they're part of your codebase
- **entrypoint.sh now uses `migrate deploy`** - safe for production restarts

## Common Scenarios

### Adding a New Field

```prisma
model User {
  bio String? // New optional field
}
```

```bash
npx prisma migrate dev --name add_user_bio
```

### Making a Field Required (Risky)

```prisma
model User {
  bio String // Changed from String? to String
}
```

You need a two-step migration:
1. Add field as optional, populate data
2. Make it required

### Renaming a Field (Data Loss Risk)

Prisma sees this as drop + create. Use raw SQL in migration:

```sql
-- In migration file
ALTER TABLE users RENAME COLUMN old_name TO new_name;
```

### Deleting a Field

```prisma
model User {
  // bio String? -- Removed
}
```

```bash
npx prisma migrate dev --name remove_user_bio
```

Data in that column will be lost permanently.
