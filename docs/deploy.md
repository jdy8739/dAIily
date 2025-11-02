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
- **Application**: Next.js 15 in Docker container (Node.js 20 Alpine)
- **Database**: PostgreSQL 16 in Docker container
- **Reverse Proxy**: Nginx on host (SSL termination)
- **SSL**: Let's Encrypt via Certbot

## Deployment Flow

### Initial Setup

1. **AWS EC2 Setup**
   - Launch EC2 instance (t3.micro recommended)
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
   - Copy `.env` file from local to EC2 (contains all required variables)
   - Verify `.env` exists before proceeding
   - Build Docker images
   - Run Prisma migrations: `docker compose run --rm app npx prisma migrate deploy`
   - (Optional) Seed database: `docker compose run --rm app npx prisma db seed`

4. **Web Server Configuration**
   - Install Nginx: `sudo apt install nginx`
   - Configure Nginx reverse proxy (see [nginx.conf](./nginx.conf))
   - Obtain SSL certificate with Certbot
   - Enable HTTPS redirect
   - Restart Nginx: `sudo systemctl restart nginx`

### Update Process

1. Pull latest code: `git pull origin main`
2. Rebuild containers: `docker compose up -d --build` (automatically loads `.env`)
3. Run Prisma migrations (if schema changed): `docker compose run --rm app npx prisma migrate deploy`
4. Verify deployment: `docker compose ps` and check logs

## Key Components

### Dockerfile
Multi-stage build with security best practices:

**Build Stage:**
- Dependencies installation (`npm ci`)
- Prisma Client generation (`npx prisma generate`)
- Next.js build with standalone output (`next build`)

**Runtime Stage (Node.js 20 Alpine):**
- Install `wget` for Docker health checks
- Create non-root `nodejs` user (UID 1001) for security
- Copy Prisma schema and generated client
- Run container as `nextjs` user (no root access)

**Important Prisma Steps:**
```dockerfile
# Build stage
RUN npx prisma generate

# Runtime stage
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Security: Run as non-root user
USER nextjs
```

**Docker Compose Configuration:**
- Service includes health checks (wget-based ping every 30 seconds)
- Automatic restart unless stopped
- Environment: `NODE_ENV=production` (required for Next.js optimization)

### docker-compose.yml
Services:
- Next.js app (port 3000)
- PostgreSQL (port 5432)
- Persistent volume for database

### Nginx Configuration

Template available in [nginx.conf](./nginx.conf)

**Setup Steps:**
```bash
# 1. Copy template config
sudo cp ~/daiily/docs/nginx.conf /etc/nginx/sites-available/daiily

# 2. Edit config with your domain
sudo nano /etc/nginx/sites-available/daiily
# Replace "yourdomain.com" with your actual domain

# 3. Enable site
sudo ln -s /etc/nginx/sites-available/daiily /etc/nginx/sites-enabled/daiily

# 4. Remove default site
sudo rm /etc/nginx/sites-enabled/default

# 5. Test Nginx config
sudo nginx -t

# 6. Restart Nginx
sudo systemctl restart nginx

# 7. Get SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 8. Restart Nginx again (now with SSL)
sudo systemctl restart nginx
```

**Features:**
- SSL/TLS termination (HTTPS)
- Reverse proxy to Docker container on localhost:3000
- Static asset caching for Next.js
- Security headers (HSTS, X-Frame-Options, CSP)
- Gzip compression
- HTTP → HTTPS redirect

### Environment Variables

Your `.env` file contains all required variables and is protected by `.gitignore`. When deploying to EC2:

**Copy `.env` to EC2:**
```bash
scp .env ubuntu@your-ec2-ip:/home/ubuntu/daiily/
```

**Verify your `.env` contains:**

**Database:**
```
DATABASE_URL=postgresql://jeongdoyeong@localhost:5432/daiily
POSTGRES_PASSWORD=your_secure_password
```

**Authentication & Security:**
```
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com
CSRF_SECRET=your_csrf_secret
```

**OAuth Providers:**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
```

**External APIs:**
```
OPENAI_API_KEY=your_openai_key
RESEND_API_KEY=your_resend_key
```

**Notes:**
- `docker-compose.yml` loads all variables from `.env` via `env_file` directive
- `docker-compose.yml` automatically sets `NODE_ENV=production` for Next.js optimization
- `POSTGRES_PASSWORD` is used by both the app and database service initialization
- `.env` is protected by `.gitignore` - never committed to git

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

## Monitoring & Health Checks

Both services have health checks configured in `docker-compose.yml`:

**Application Container:**
- Health check: HTTP GET to `http://localhost:3000/`
- Interval: Every 30 seconds
- Timeout: 10 seconds
- Retries: 3 failures before unhealthy
- Start period: 40 seconds (allows startup time)

**Database Container:**
- Health check: `pg_isready` command
- Interval: Every 10 seconds
- Timeout: 5 seconds
- Retries: 5 failures before unhealthy
- Start period: 10 seconds

**Verify Health:**
```bash
docker compose ps  # Shows health status
```

Output should show:
```
STATUS           PORTS
Up 5 minutes (healthy)  0.0.0.0:3000->3000/tcp
Up 5 minutes (healthy)  5432/tcp
```

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

# Rebuild and restart containers (uses .env)
docker compose up -d --build

# Run migrations if schema changed
docker compose run --rm app npx prisma migrate deploy

# Verify
docker compose ps  # Check health status
docker compose logs -f app
```

**Note:** The docker-compose.yml already loads `.env` via `env_file` directive, so all environment variables (database, auth, API keys) are automatically available to containers.

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
- AWS costs after free tier (~$10-15/month for t3.micro)
