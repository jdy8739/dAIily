# Deployment Guide

**Stack**: Docker Compose, t3.micro optimized

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Client (HTTPS)                              │
│              https://daiily.site                             │
│          (AWS t3.micro EC2 Instance)                         │
└──────────────────────────┬─────────────────────────────────┘
                           │
    ┌──────────────────────┴──────────────────────┐
    │  Nginx Reverse Proxy (Alpine)                │
    │  Ports: 80 (HTTP→HTTPS) / 443 (SSL/TLS)     │
    │  Memory: 50MB / CPU: 0.2                    │
    │  Features: Gzip, 1y static cache            │
    └──────────────────────┬──────────────────────┘
                           │
    ┌──────────────────────┴──────────────────────┐
    │  Next.js App (Node.js Alpine)               │
    │  Port: 3000 (Internal Only)                 │
    │  Memory: 400MB / CPU: 0.5                   │
    │  Heap: 300MB, Auto migrations               │
    └──────────────────────┬──────────────────────┘
                           │
    ┌──────────────────────┴──────────────────────┐
    │  PostgreSQL Database (Alpine)               │
    │  Port: 5432 (Internal Only)                 │
    │  Memory: 200MB / CPU: 0.3                   │
    │  Config: max_connections=20                 │
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

- Docker & Docker Compose
- Domain + DNS configured
- SSL certs: `./ssl/cert.pem` and `./ssl/key.pem`
- **AWS t3.micro minimum** (1GB RAM, supports ~10-20 concurrent users)
- 20GB storage

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

1. Clone repository: `git clone <repo-url> /path/to/daiily && cd /path/to/daiily`
2. Create SSL certificates: `mkdir -p ssl && openssl req -x509 -newkey rsa:4096 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365`
3. Create `.env` file with variables from "Environment Variables" section above
4. Start: `docker-compose -f docker-compose.prod.yml up -d`
5. Verify: `docker-compose -f docker-compose.prod.yml ps`

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
| Database migrations fail | Check app logs. Verify DB container is healthy: `docker-compose -f docker-compose.prod.yml ps` |
| SSL certificate errors | Verify `./ssl/cert.pem` and `./ssl/key.pem` exist. Check nginx logs. |
| OAuth redirects to wrong URL | Ensure `NEXTAUTH_URL=https://daiily.site` in .env. Verify provider redirect URIs match. |
| Database connection refused | Check `POSTGRES_PASSWORD` matches in .env and docker-compose.prod.yml. Check DB logs. |
| Out of memory errors | Upgrade to t3.small. Monitor with `docker stats`. |

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

