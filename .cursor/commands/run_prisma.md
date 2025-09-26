# Run Prisma Commands

## Order of Operations to Start Prisma Studio

1. **Clean cache (if corrupted)**
   ```bash
   npm cache clean --force
   ```

2. **Remove corrupted Prisma files (if needed)**
   ```bash
   rm -rf node_modules/.prisma && rm -rf node_modules/prisma
   ```

3. **Reinstall Prisma packages**
   ```bash
   npm install prisma @prisma/client
   ```

4. **Regenerate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Start Prisma dev server (REQUIRED FIRST)**
   ```bash
   npx prisma dev
   ```

6. **Start Prisma Studio**
   ```bash
   npx prisma studio
   ```

## Quick Start (Normal Usage)

```bash
# 1. Start database server
npx prisma dev

# 2. Start web interface (in another terminal)
npx prisma studio
```

## Access Points

- **Prisma Studio**: http://localhost:5556
- **Database Ports**: 51213-51215

## Stop Services

```bash
pkill -f "prisma studio" && pkill -f "prisma dev"
```