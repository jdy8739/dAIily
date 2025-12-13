# Deployment Guide

**Stack**: Docker Compose, AWS Lightsail t3.micro, GitHub Actions CI/CD

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

## Services Configuration

| Service | Image | Memory | CPU | Notes |
|---------|-------|--------|-----|-------|
| **App** | node:20-alpine | 400M limit / 200M reserve | 0.5 / 0.25 | Standalone mode, Heap: 300MB, auto migrations |
| **Nginx** | nginx:alpine | 50M limit / 20M reserve | 0.2 / 0.1 | Gzip, 1y static cache, 256 workers |
| **DB** | postgres:16-alpine | 200M limit / 100M reserve | 0.3 / 0.1 | max_connections: 20, 32MB shared_buffers |

## Prerequisites

- **AWS Lightsail t3.micro** (1GB RAM, 1 vCPU, 20GB SSD)
- **Domain**: DNS A record pointing to server IP
- **Firewall**: Ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open
- **Docker & Docker Compose** installed on server
- **GitHub Repository**: With GitHub Secrets configured (see below)

## Environment Variables

Create `.env` file on your Lightsail server at `~/dAIily/.env`:

```env
# Database
POSTGRES_PASSWORD=<secure-password>

# NextAuth
NEXTAUTH_URL=https://daiily.site
NEXTAUTH_SECRET=<secure-secret>

# Auth Secrets
JWT_SECRET=<secure-secret>
SESSION_SECRET=<secure-secret>
CSRF_SECRET=<secure-secret>

# OAuth (Google)
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>

# OAuth (GitHub)
GITHUB_CLIENT_ID=<your-id>
GITHUB_CLIENT_SECRET=<your-secret>

# External APIs
OPENAI_API_KEY=<your-key>
RESEND_API_KEY=<your-key>
```

**OAuth redirect URIs**:
- Google: `https://daiily.site/api/auth/callback/google`
- GitHub: `https://daiily.site/api/auth/callback/github`

## Initial Server Setup

### 1. Install Docker & Docker Compose

```bash
ssh -i key.pem ubuntu@server-ip
sudo apt update
sudo apt install -y docker.io
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker ubuntu
```

### 2. Setup Project Directory

```bash
mkdir -p ~/dAIily
cd ~/dAIily
```

### 3. Configure SSL Certificates

```bash
# Create SSL directory
mkdir -p ssl

# Generate Let's Encrypt certificates
sudo certbot certonly --standalone -d daiily.site

# Copy certificates
sudo cp /etc/letsencrypt/live/daiily.site/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/daiily.site/privkey.pem ssl/key.pem
sudo chown ubuntu:ubuntu ssl/*.pem
```

### 4. Configure AWS Lightsail Firewall

- Go to AWS Lightsail Console
- Instance → Networking → Firewall
- Add rules: HTTP (80), HTTPS (443), SSH (22)

## CI/CD Deployment (Automated via GitHub Actions)

### GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description | Example |
|--------|-------------|---------|
| `LIGHTSAIL_HOST` | Server IP or domain | `123.45.67.89` or `daiily.example.com` |
| `LIGHTSAIL_USERNAME` | SSH username | `ubuntu` |
| `LIGHTSAIL_SSH_KEY` | Private SSH key | `-----BEGIN RSA PRIVATE KEY-----...` |

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### Generate SSH Key

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"

# Copy private key
cat ~/.ssh/id_rsa
# → Paste into LIGHTSAIL_SSH_KEY secret

# Copy public key to Lightsail
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@your-server-ip
```

### Workflow Triggers

The deployment workflow (`.github/workflows/deploy.yml`) runs:

- **Automatically**: When code is pushed to `main` branch
- **Manually**: Via GitHub Actions UI → Actions tab → Run workflow

### How It Works

1. **Build**: Builds Docker image and pushes to GitHub Container Registry (GHCR)
2. **Deploy**: SSH into Lightsail, pulls latest image, and restarts containers
3. **Verify**: Waits 20 seconds, then displays app logs for verification

### Workflow Steps

1. Checkout code
2. Set up Docker Buildx (enables layer caching)
3. Log in to GitHub Container Registry
4. Extract metadata (tags: latest, branch, commit SHA)
5. Build and push Docker image to GHCR
6. SSH to Lightsail server
7. Log in to GHCR and pull latest image
8. Stop old containers
9. Start new containers
10. Wait for app startup
11. Display logs and health status

## Manual Deployment (Alternative)

### One-Time Setup

```bash
# Copy project files to server
scp -i key.pem -r . ubuntu@server-ip:~/dAIily/
```

### Deploy Code Changes

```bash
ssh -i key.pem ubuntu@server-ip
cd ~/dAIily

# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## Database & Schema Changes

### Local Development (Before Deploying)

```bash
# 1. Update prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name describe_your_changes

# 3. Commit and push
git add prisma/migrations/
git commit -m "feat: update schema"
git push
```

### Server Deployment

#### First Time (Baseline Migration)

```bash
cd ~/dAIily

# Backup database
mkdir -p backups
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Run baseline (syncs schema + marks migrations as applied)
docker-compose -f docker-compose.prod.yml run --rm app /app/entrypoint-baseline.sh

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

#### Subsequent Updates

```bash
cd ~/dAIily

# Backup database
mkdir -p backups
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Rebuild and restart (migrations run automatically)
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

#### Rollback

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < backups/backup_TIMESTAMP.sql
docker-compose -f docker-compose.prod.yml restart app
```

## Monitoring & Logs

### Check Workflow Status (GitHub Actions)

1. Go to **Actions** tab in GitHub
2. Click on latest workflow run
3. View logs for build and deploy jobs

### Check Server Status

```bash
ssh -i key.pem ubuntu@server-ip
cd ~/dAIily

# Container status
docker-compose -f docker-compose.prod.yml ps

# All service logs (real-time)
docker-compose -f docker-compose.prod.yml logs -f

# Specific service logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f db

# Last 50 lines
docker-compose -f docker-compose.prod.yml logs --tail=50 app

# Resource usage
docker stats
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **502 Bad Gateway** | App container not running. Run: `docker-compose -f docker-compose.prod.yml restart` |
| **Site not accessible** | Check AWS Lightsail firewall rules (ports 80, 443) |
| **SSL certificate errors** | Run certbot and copy certificates to `./ssl/` directory |
| **Database connection failed** | Use plain hex password in DATABASE_URL, verify `db:5432` not `localhost:5432` |
| **Nginx restarting** | Check SSL certificates exist: `ls -la ssl/` |
| **Build memory errors** | Add swap: `sudo fallocate -l 2G /swapfile && sudo swapon /swapfile` |
| **Environment validation failed** | DATABASE_URL must use `db:5432` not `localhost:5432` |
| **Authentication failed (postgres)** | Run: `docker-compose -f docker-compose.prod.yml down -v && docker-compose -f docker-compose.prod.yml up -d` |
| **HTML entities in .env** | Remove HTML entities, use plain quotes or no quotes |
| **Login always fails** | Check app logs for DB errors. Verify OAuth redirect URIs match domain |
| **Migration error: database not empty** | Run baseline: `docker-compose -f docker-compose.prod.yml run --rm app /app/entrypoint-baseline.sh` |

### SSH Connection Issues (CI/CD)

```bash
# Test SSH locally
ssh -i ~/.ssh/your_key ubuntu@server-ip

# Verify key format (should start with -----BEGIN)
# Remove extra spaces/line breaks when pasting into GitHub secrets
```

### Docker Pull Issues

```bash
# Test manually
docker pull ghcr.io/jdy8739/daiily:latest

# Check if logged in to GHCR
docker login ghcr.io -u yourusername
```

### Migration Issues

```bash
cd ~/dAIily

# Manually run migrations
docker-compose -f docker-compose.prod.yml run --rm app sh -c "prisma migrate deploy"

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## Rollback Procedure

```bash
cd ~/dAIily

# List available images
docker images | grep daiily

# Edit docker-compose.prod.yml to use specific SHA tag
# Change: image: ghcr.io/jdy8739/daiily:latest
# To: image: ghcr.io/jdy8739/daiily:main-abc1234

# Restart with old image
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Maintenance

### SSL Certificate Renewal

```bash
# Renew Let's Encrypt (every 60 days)
sudo certbot renew
sudo cp /etc/letsencrypt/live/daiily.site/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/daiily.site/privkey.pem ssl/key.pem
sudo chown ubuntu:ubuntu ssl/*.pem
docker-compose -f docker-compose.prod.yml restart nginx
```

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backup-$(date +%Y%m%d).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < backup-20241201.sql
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

### Health Checks

```bash
# Test app from nginx container
docker-compose -f docker-compose.prod.yml exec nginx wget -O- http://app:3000

# Test database connection
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d daiily -c "SELECT 1;"

# Check external access
curl -I https://daiily.site
```

## Performance Optimizations

- **Standalone output mode**: Next.js outputs minimal server (~50-70% smaller)
- **Multi-stage Docker build**: Separates build and runtime stages
- **Alpine Linux**: Tiny base image (5MB)
- **Selective Prisma copy**: Only Prisma client and CLI for migrations
- **Nginx**: 256 worker connections, gzip compression, 1-year static cache
- **PostgreSQL**: shared_buffers 32MB, max_connections 20
- **Node.js heap**: Limited to 300MB
- **GitHub Actions cache**: Layer caching reduces build time by ~50%
- **Image cleanup**: Old images pruned after 24 hours

## Cost Analysis (t3.micro)

- **Instance**: ~$4-6/month
- **Storage (20GB)**: ~$2/month
- **Data transfer**: ~$0.09/GB outbound
- **Total**: ~$6-8/month

**Scaling**:
- t3.micro: 10-20 concurrent users, 100K-500K requests/day
- t3.small: 50-100 concurrent users, 1M+ requests/day

## Security

✅ **Implemented**:
- HTTPS only (HTTP redirects to HTTPS)
- Environment variables never committed
- PostgreSQL on internal network only
- JWT sessions with secure cookies
- CSRF protection (HMAC-SHA256)
- CSP headers via Next.js middleware
- Non-root user in Docker
- Let's Encrypt SSL certificates (auto-renewal recommended)
- GitHub Secrets for sensitive data (never in code)
- SSH key-based authentication only
