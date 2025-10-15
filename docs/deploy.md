# Deployment Strategy

## Overview

Production deployment using **AWS EC2 + Docker Compose + Nginx** for containerized application with traditional reverse proxy.

## Architecture

```
Internet → AWS EC2 Instance
            ├── Nginx (Host) - SSL Termination
            └── Docker Compose Network
                  ├── Next.js App Container
                  └── PostgreSQL Container
```

**Tech Stack:**
- **Infrastructure**: AWS EC2 (Ubuntu 22.04 LTS)
- **Application**: Next.js 15 in Docker container
- **Database**: PostgreSQL 16 in Docker container
- **Reverse Proxy**: Nginx on host (SSL termination)
- **SSL**: Let's Encrypt via Certbot

## Deployment Flow

### Initial Setup

1. **AWS EC2 Setup**
   - Launch EC2 instance (t2.micro or t3.micro recommended)
   - Ubuntu 22.04 LTS AMI
   - Configure Security Groups (SSH:22, HTTP:80, HTTPS:443)
   - Attach Elastic IP for static IP address
   - Setup SSH key pair authentication
   - Create non-root user with sudo privileges

2. **Install Dependencies**
   - Docker & Docker Compose
   - Nginx
   - Certbot

3. **Application Setup**
   - Clone repository
   - Configure environment variables
   - Build Docker images
   - Run Prisma migrations: `docker compose run --rm app npx prisma migrate deploy`
   - (Optional) Seed database: `docker compose run --rm app npx prisma db seed`

4. **Web Server Configuration**
   - Configure Nginx reverse proxy
   - Obtain SSL certificate
   - Enable HTTPS redirect

### Update Process

1. Pull latest code: `git pull origin main`
2. Rebuild containers: `docker compose up -d --build`
3. Run Prisma migrations (if schema changed): `docker compose run --rm app npx prisma migrate deploy`
4. Verify deployment: `docker compose ps` and check logs

## Key Components

### Dockerfile
Multi-stage build:
- Dependencies installation (`npm ci`)
- Prisma Client generation (`npx prisma generate`)
- Next.js build with standalone output (`next build`)
- Minimal production runtime (Node.js Alpine)
- Copy Prisma schema and generated client to runtime

**Important Prisma Steps:**
```dockerfile
# Build stage
RUN npx prisma generate

# Runtime stage
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
```

### docker-compose.yml
Services:
- Next.js app (port 3000)
- PostgreSQL (port 5432)
- Persistent volume for database

### Nginx Configuration
- SSL/TLS termination
- Reverse proxy to Docker container
- Static asset caching
- Security headers

### Environment Variables
Required:
- Database credentials
- Authentication secrets (JWT, NextAuth, CSRF)
- OAuth credentials (Google, GitHub)
- API keys (OpenAI, Resend)

## Database & Prisma Setup

### Initial Database Setup

1. **Start PostgreSQL container:**
   ```bash
   docker compose up -d db
   ```

2. **Run migrations to create tables:**
   ```bash
   docker compose run --rm app npx prisma migrate deploy
   ```

3. **Verify database connection:**
   ```bash
   docker compose exec db psql -U postgres -d daiily -c "\dt"
   ```

4. **(Optional) Seed initial data:**
   ```bash
   docker compose run --rm app npx prisma db seed
   ```

### Database Operations

**View database:**
```bash
docker compose exec db psql -U postgres -d daiily
```

**Run new migrations (after schema changes):**
```bash
docker compose run --rm app npx prisma migrate deploy
```

**Reset database (DESTRUCTIVE - deletes all data):**
```bash
docker compose run --rm app npx prisma migrate reset --force
```

**Backup database:**
```bash
docker compose exec db pg_dump -U postgres daiily > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore database:**
```bash
cat backup.sql | docker compose exec -T db psql -U postgres -d daiily
```

### Prisma Client

The Prisma Client is generated during Docker build and must be included in the runtime container. If you see "Cannot find module '@prisma/client'" errors, ensure:

1. `npx prisma generate` runs in the Dockerfile build stage
2. Both `/app/prisma` and `/app/node_modules/.prisma` are copied to the runtime stage
3. The `DATABASE_URL` environment variable is set correctly in production

## Maintenance

### Automated Backups

Setup daily PostgreSQL backups with cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/daiily && docker compose exec -T db pg_dump -U postgres daiily | gzip > /backups/daiily_$(date +\%Y\%m\%d).sql.gz
```

### Monitoring

- **Application Logs**: `docker compose logs -f app`
- **Database Logs**: `docker compose logs -f db`
- **Nginx Logs**: `tail -f /var/log/nginx/access.log /var/log/nginx/error.log`
- **Container Status**: `docker compose ps`

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart containers
docker compose up -d --build

# Run migrations if schema changed
docker compose run --rm app npx prisma migrate deploy

# Verify
docker compose ps
docker compose logs -f app
```

### SSL Certificate Renewal

Certbot auto-renews certificates. Verify renewal:
```bash
sudo certbot renew --dry-run
```

## Why This Setup?

**Pros:**
- Industry-standard production stack (AWS + Docker + Nginx)
- AWS free tier eligible (750 hours/month for 12 months)
- Docker containers provide isolation and consistency
- Nginx on host simplifies SSL management
- Full control over infrastructure
- Easy to scale (upgrade EC2 instance, migrate to ECS/EKS later)
- Learning DevOps and cloud fundamentals

**Cons:**
- More manual setup than PaaS (Vercel, Railway)
- Requires server maintenance and monitoring
- Need to manage security updates
- AWS costs after free tier (~$10-20/month for small instance)
