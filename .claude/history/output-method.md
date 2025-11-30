# Next.js Docker Output Methods

## Problem: Prisma CLI in Docker

**Issue**: Running `npx prisma db push` in production container requires Prisma CLI + dependencies, but Next.js standalone output doesn't include node_modules.

## Solution 1: Full Build (Current)

**Approach**: Copy entire node_modules to production image

```dockerfile
# next.config.ts - Remove standalone output
const nextConfig: NextConfig = {
  // output: "standalone", // ❌ Remove this
}

# Dockerfile - Copy full node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# entrypoint.sh - Auto-migrations work
npx prisma db push
npm start
```

**Pros**:

- ✅ Auto-migrations work
- ✅ Simple deployment
- ✅ All dependencies available

**Cons**:

- ❌ Large image (~300MB)
- ❌ Slower builds
- ❌ Includes dev dependencies

**Use when**: Convenience > optimization, small projects

---

## Solution 2: Standalone + Manual Migrations (Recommended)

**Approach**: Minimal runtime, separate migration step

```dockerfile
# next.config.ts - Enable standalone
const nextConfig: NextConfig = {
  output: "standalone",
}

# Dockerfile - Copy only standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# entrypoint.sh - No migrations
node server.js
```

**Migration**: Run manually when schema changes

```bash
docker-compose exec app npx prisma db push
```

**Pros**:

- ✅ Small image (~100MB)
- ✅ Fast startup
- ✅ Production best practice

**Cons**:

- ❌ Manual migration step
- ❌ Extra deployment complexity

**Use when**: Production optimization matters, scaling

---

## Solution 3: Production Dependencies Only

**Approach**: Install only production node_modules

```dockerfile
# Dockerfile - Production deps only
RUN npm ci --omit=dev
COPY --from=builder /app/node_modules ./node_modules
```

**Pros**:

- ✅ Smaller than full (~150MB)
- ✅ Auto-migrations work
- ✅ No dev dependencies

**Cons**:

- ❌ Still larger than standalone

**Use when**: Balance between size and convenience

---

## Recommendation

- **MVP/Small projects**: Solution 1 (current)
- **Production/Scale**: Solution 2
- **Hybrid needs**: Solution 3
