#!/bin/bash
# Run this ONCE on server after first deployment or schema changes

docker-compose -f docker-compose.prod.yml run --rm -e DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/daiily" app sh -c "npx prisma db push"
