# Deployment Guide

**Stack**: Docker Compose, t3.micro optimized

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Internet                                 │
│                 daiily.site → [SERVER-IP]                   │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────┴─────────────────────────────────┐
│              AWS Lightsail t3.micro                        │
│                  Ubuntu 22.04                              │
│              Firewall: 22, 80, 443                         │
└──────────────────────────┬─────────────────────────────────┘
                           │
    ┌──────────────────────┴──────────────────────┐
    │  Nginx Reverse Proxy (Alpine)                │
    │  Ports: 80→443 redirect / 443 SSL           │
    │  SSL: Let's Encrypt (certbot)               │
    │  Memory: 50MB / CPU: 0.2                    │
    └──────────────────────┬──────────────────────┘
                           │ http://app:3000
    ┌──────────────────────┴──────────────────────┐
    │  Next.js App (Node.js Alpine)               │
    │  Port: 3000 (Docker network only)           │
    │  Memory: 400MB / CPU: 0.5                   │
    │  DATABASE_URL: postgres://...@db:5432       │
    └──────────────────────┬──────────────────────┘
                           │ postgresql://
    ┌──────────────────────┴──────────────────────┐
    │  PostgreSQL 16 (Alpine)                     │
    │  Port: 5432 (Docker network only)           │
    │  Memory: 200MB / CPU: 0.3                   │
    │  Volume: postgres_data (persistent)         │
    └─────────────────────────────────────────────┘
```

**NOTE**: This architecture diagram is ESSENTIAL. Do not remove when trimming unnecessary data.

## Services Configuration

| Service   | Image              | Memory                    | CPU        | Notes                                              |
| --------- | ------------------ | ------------------------- | ---------- | -------------------------------------------------- |
| **App**   | node:20-alpine     | 400M limit / 200M reserve | 0.5 / 0.25 | Standalone mode, Heap: 300MB, auto migrations      |
| **Nginx** | nginx:alpine       | 50M limit / 20M reserve   | 0.2 / 0.1  | Gzip, 1y static cache, 256 workers                 |
| **DB**    | postgres:16-alpine | 200M limit / 100M reserve | 0.3 / 0.1  | max_connections: 20, 32MB shared_buffers           |

## Prerequisites

- **AWS Lightsail t3.micro** (1GB RAM, 1 vCPU, 20GB SSD)
- **Domain**: DNS A record pointing to server IP
- **Firewall**: Ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open
- **SSL**: Let's Encrypt certificates via certbot
- **Docker & Docker Compose** installed

## Environment Variables (`.env`)

```env
POSTGRES_PASSWORD=<secure-password>
NEXTAUTH_SECRET=<secure-secret>
JWT_SECRET=<secure-secret>
SESSION_SECRET=<secure-secret>
NEXTAUTH_URL=https://daiily.site
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
GITHUB_CLIENT_ID=<your-id>
GITHUB_CLIENT_SECRET=<your-secret>
CSRF_SECRET=<secure-secret>
OPENAI_API_KEY=<your-key>
RESEND_API_KEY=<your-key>
```

**OAuth redirect URIs**:

- Google: `https://daiily.site/api/auth/callback/google`
- GitHub: `https://daiily.site/api/auth/callback/github`

## Initial Deployment

### 1. Server Setup

```bash
# Install Docker & Docker Compose
sudo apt update
sudo apt install -y docker.io
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker ubuntu
```

### 2. Deploy Application

```bash
# Copy project files to server
scp -i key.pem -r . ubuntu@server-ip:~/daiily/

# SSH to server
ssh -i key.pem ubuntu@server-ip
cd daiily

# Create SSL certificates
mkdir -p ssl
sudo certbot certonly --standalone -d daiily.site
sudo cp /etc/letsencrypt/live/daiily.site/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/daiily.site/privkey.pem ssl/key.pem
sudo chown ubuntu:ubuntu ssl/*.pem

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Configure AWS Lightsail Firewall

- Go to AWS Lightsail Console
- Instance → Networking → Firewall
- Add rules: HTTP (80), HTTPS (443), SSH (22)

## Schema Updates & Migrations

### Local Development (Before Deploying)

```bash
# 1. Update prisma/schema.prisma with your changes

# 2. Create migration
npx prisma migrate dev --name describe_your_changes

# 3. Commit and push
git add prisma/migrations/
git commit -m "feat: update schema"
git push
```

### Server Deployment with Schema Changes

**For existing production database (first time migrating):**

```bash
# On server
git pull

# Backup database first
mkdir -p backups
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Run one-time baseline (syncs schema + marks migrations as applied)
docker-compose -f docker-compose.prod.yml run --rm app /app/entrypoint-baseline.sh

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

**For subsequent schema updates (after baseline):**

```bash
# On server
git pull

# Backup database
mkdir -p backups
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Rebuild and restart (migrations run automatically via entrypoint.sh)
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Rollback Schema Changes

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < backups/backup_TIMESTAMP.sql
docker-compose -f docker-compose.prod.yml restart app
```

## Code Updates (No Schema Changes)

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

**Command breakdown**:

- `up -d --build` - Rebuild images and restart containers in one command
- `logs -f app` - Follow app logs in real-time (Ctrl+C to exit)

**Important**: Always run `up -d` after `build` to recreate containers and reconnect Docker networks. Rebuilding only the app without restarting can cause 502 errors.

## Database Management

Migrations run automatically on startup. PostgreSQL has `max_connections=20` - set `connection_limit=10` in DATABASE_URL if needed.

**Common commands**:

```bash
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d daiily           # Connect to DB
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backup.sql  # Backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < backup.sql  # Restore
```

## Docker Commands Reference

### Container Management

```bash
# List running containers
docker-compose -f docker-compose.prod.yml ps

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart app

# Rebuild specific service
docker-compose -f docker-compose.prod.yml build --no-cache app

# Remove all containers and volumes (DESTRUCTIVE)
docker-compose -f docker-compose.prod.yml down -v
```

### Monitoring & Logs

```bash
# View logs (real-time)
docker-compose -f docker-compose.prod.yml logs -f          # All services
docker-compose -f docker-compose.prod.yml logs -f app      # App only
docker-compose -f docker-compose.prod.yml logs -f db       # Database only
docker-compose -f docker-compose.prod.yml logs -f nginx    # Nginx only

# View last 50 lines
docker-compose -f docker-compose.prod.yml logs --tail=50 app

# Monitor resource usage
docker stats
```

### Health Checks

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Test app from nginx container
docker-compose -f docker-compose.prod.yml exec nginx wget -O- http://app:3000

# Test database connection
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d daiily -c "SELECT 1;"

# Check external access
curl -I https://daiily.site
```

### Common Issues

| Issue                               | Solution                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 502 Bad Gateway                     | App container not running or network disconnected. Run: `docker-compose -f docker-compose.prod.yml restart`                                     |
| Site not accessible externally      | Check AWS Lightsail firewall rules (ports 80, 443)                                                                                              |
| SSL certificate errors              | Run certbot and copy certificates to `./ssl/` directory                                                                                         |
| Database connection failed          | Use hex password without special characters in DATABASE_URL                                                                                     |
| Nginx restarting                    | Check SSL certificates exist: `ls -la ssl/`                                                                                                     |
| Build memory errors                 | Add swap: `sudo fallocate -l 2G /swapfile && sudo swapon /swapfile`                                                                             |
| Environment validation failed       | Ensure DATABASE_URL uses `db:5432` not `localhost:5432`                                                                                         |
| Authentication failed (postgres)    | Database created with old password. Run: `docker-compose -f docker-compose.prod.yml down -v && docker-compose -f docker-compose.prod.yml up -d` |
| HTML entities in .env (&quot;)      | Remove HTML entities, use plain quotes or no quotes for simple values                                                                           |
| Login always fails                  | Check app logs for database connection errors. Verify OAuth redirect URIs match domain                                                          |
| App container missing after rebuild | Rebuilt app without restarting services. Run: `docker-compose -f docker-compose.prod.yml up -d`                                                 |
| Migration error: database not empty | Database exists but migrations not tracked. Run baseline: `docker-compose -f docker-compose.prod.yml run --rm app /app/entrypoint-baseline.sh` |

## Optimizations

- **Standalone output mode**: Next.js outputs minimal server with only required dependencies (~50-70% smaller)
- **Multi-stage Docker build**: Separates build and runtime stages
- **Alpine Linux**: Tiny base image (5MB)
- **Selective Prisma copy**: Only Prisma client and CLI for migrations (not full node_modules)
- **Nginx**: 256 worker connections, gzip compression, 1-year static cache
- **PostgreSQL**: shared_buffers 32MB, max_connections 20
- **Node.js heap**: Limited to 300MB

**Benefits of standalone mode**:
- Smaller Docker image size
- Faster container startup
- Lower memory footprint
- Only necessary dependencies bundled

Monitor with: `docker stats` and `docker-compose -f docker-compose.prod.yml logs -f`

## Cost Analysis (AWS t3.micro)

- **Instance**: ~$4-6/month
- **Storage (20GB)**: ~$2/month
- **Data transfer**: ~$0.09/GB outbound
- **Total**: ~$6-8/month

**Scaling**:

- t3.micro: 10-20 concurrent users, 100K-500K requests/day
- t3.small: 50-100 concurrent users, 1M+ requests/day

## Maintenance

### SSL Certificate Renewal

```bash
# Renew Let's Encrypt certificates (run every 60 days)
sudo certbot renew
sudo cp /etc/letsencrypt/live/daiily.site/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/daiily.site/privkey.pem ssl/key.pem
sudo chown ubuntu:ubuntu ssl/*.pem
docker-compose -f docker-compose.prod.yml restart nginx
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backup-$(date +%Y%m%d).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < backup-20241201.sql
```

## Security

- HTTPS only (HTTP redirects to HTTPS)
- Environment variables never committed
- PostgreSQL internal network only
- JWT sessions with secure cookies
- CSRF protection (HMAC-SHA256)
- CSP headers via Next.js middleware
- Non-root user in Docker
- Let's Encrypt SSL certificates (auto-renewal recommended)
