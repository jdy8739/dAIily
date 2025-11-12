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

| Service | Image | Memory | CPU | Notes |
|---------|-------|--------|-----|-------|
| **App** | node:20-alpine | 400M limit / 200M reserve | 0.5 / 0.25 | Heap: 300MB, auto migrations |
| **Nginx** | nginx:alpine | 50M limit / 20M reserve | 0.2 / 0.1 | Gzip, 1y static cache, 256 workers |
| **DB** | postgres:16-alpine | 200M limit / 100M reserve | 0.3 / 0.1 | max_connections: 20, 32MB shared_buffers |

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

## Deployment Steps

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

**To Update**: `git pull && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --build`

## Database Management

Migrations run automatically on startup. PostgreSQL has `max_connections=20` - set `connection_limit=10` in DATABASE_URL if needed.

**Common commands**:
```bash
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d daiily           # Connect to DB
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backup.sql  # Backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < backup.sql  # Restore
```

## Monitoring & Troubleshooting

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f          # All services
docker-compose -f docker-compose.prod.yml logs -f app      # App only
docker-compose -f docker-compose.prod.yml logs -f db       # Database only
docker-compose -f docker-compose.prod.yml logs -f nginx    # Nginx only
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Site not accessible externally | Check AWS Lightsail firewall rules (ports 80, 443) |
| SSL certificate errors | Run certbot and copy certificates to `./ssl/` directory |
| Database connection failed | Use hex password without special characters in DATABASE_URL |
| Nginx restarting | Check SSL certificates exist: `ls -la ssl/` |
| Build memory errors | Add swap: `sudo fallocate -l 2G /swapfile && sudo swapon /swapfile` |
| Environment validation failed | Ensure DATABASE_URL uses `db:5432` not `localhost:5432` |

## Optimizations

- **Multi-stage Docker build**: Minimal final image
- **Alpine Linux**: Tiny base (5MB)
- **Next.js standalone**: Reduced runtime dependencies
- **Nginx**: 256 worker connections, gzip compression, 1-year static cache
- **PostgreSQL**: shared_buffers 32MB, max_connections 20
- **Node.js heap**: Limited to 300MB

Monitor with: `docker stats` and `docker-compose -f docker-compose.prod.yml logs -f`

## Cost Analysis (AWS t3.micro)

- **Instance**: ~$4-6/month
- **Storage (20GB)**: ~$2/month
- **Data transfer**: ~$0.09/GB outbound
- **Total**: ~$6-8/month

**Scaling**:
- t3.micro: 10-20 concurrent users, 100K-500K requests/day
- t3.small: 50-100 concurrent users, 1M+ requests/day

## Security

- HTTPS only (HTTP redirects to HTTPS)
- Environment variables never committed
- PostgreSQL internal network only
- JWT sessions with secure cookies
- CSRF protection (HMAC-SHA256)
- CSP headers via Next.js middleware
- Non-root user in Docker

