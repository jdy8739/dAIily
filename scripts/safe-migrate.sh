#!/bin/bash
# Safe database migration script with automatic backup
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

echo "=== Safe Database Migration ==="
echo "Timestamp: ${TIMESTAMP}"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# 1. Backup current database
echo ""
echo "Step 1/3: Creating database backup..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres daiily > ${BACKUP_FILE}

if [ -s ${BACKUP_FILE} ]; then
    echo "✓ Backup created: ${BACKUP_FILE}"
    BACKUP_SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
    echo "  Size: ${BACKUP_SIZE}"
else
    echo "✗ Backup failed - aborting migration"
    exit 1
fi

# 2. Apply migration using prisma migrate deploy (safe for production)
echo ""
echo "Step 2/3: Applying database migration..."
docker-compose -f docker-compose.prod.yml exec -T app sh -c "npx prisma migrate deploy"

if [ $? -eq 0 ]; then
    echo "✓ Migration applied successfully"
else
    echo "✗ Migration failed"
    echo ""
    echo "To restore backup, run:"
    echo "  docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < ${BACKUP_FILE}"
    exit 1
fi

# 3. Restart app to use new schema
echo ""
echo "Step 3/3: Restarting application..."
docker-compose -f docker-compose.prod.yml restart app

echo ""
echo "=== Migration Complete ==="
echo "Backup saved at: ${BACKUP_FILE}"
echo ""
echo "To restore if needed:"
echo "  docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < ${BACKUP_FILE}"
