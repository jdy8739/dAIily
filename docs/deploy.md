# Deployment Guide

This document outlines the deployment infrastructure and procedures for Daiily.

**Live Site:** https://daiily.site

## Architecture Overview

The application is containerized with Docker and orchestrated using Docker Compose. The production stack consists of three main services:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (HTTPS)                           │
│                   https://daiily.site                        │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │     Nginx Reverse Proxy       │
         │   Port 80 → 443 (SSL/TLS)     │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         │   Next.js App Container       │
         │    Port 3000 (Internal)       │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         │  PostgreSQL Database          │
         │   Port 5432 (Internal)        │
         └───────────────────────────────┘
```

## Services

### 1. **App Service** (Next.js)
- **Image**: Built from local Dockerfile (multi-stage, Alpine-based)
- **Environment**: Production (NODE_ENV=production)
- **Port**: 3000 (internal only, exposed via nginx)
- **Startup**: Automatic database migrations via entrypoint script
- **Restart Policy**: unless-stopped
- **Resource Limits** (t3.micro optimized):
  - Memory limit: 400MB, reservation: 200MB
  - CPU limit: 0.5, reservation: 0.25
- **Heap Memory**: Limited to 300MB via NODE_OPTIONS

### 2. **Nginx Service** (Reverse Proxy)
- **Image**: nginx:alpine
- **Ports**:
  - 80 (HTTP → HTTPS redirect)
  - 443 (HTTPS with SSL/TLS)
- **Configuration**: ./nginx.conf (optimized for t3.micro)
- **SSL Certificates**: ./ssl/cert.pem and ./ssl/key.pem
- **Restart Policy**: unless-stopped
- **Resource Limits**:
  - Memory limit: 50MB, reservation: 20MB
  - CPU limit: 0.2, reservation: 0.1
- **Worker Connections**: 256 (reduced from 1024)
- **Gzip Compression**: Enabled (30-70% bandwidth savings)
- **Static Asset Caching**: 1-year browser cache for static files

### 3. **Database Service** (PostgreSQL)
- **Image**: postgres:16-alpine
- **Port**: 5432 (internal only)
- **Version**: PostgreSQL 16
- **Data**: Persistent volume (postgres_data)
- **Health Checks**: Automatic with pg_isready
- **Restart Policy**: unless-stopped
- **Resource Limits**:
  - Memory limit: 200MB, reservation: 100MB
  - CPU limit: 0.3, reservation: 0.1
- **Optimizations**:
  - shared_buffers: 32MB (t3.micro optimized)
  - effective_cache_size: 128MB
  - work_mem: 2MB
  - maintenance_work_mem: 16MB
  - max_connections: 20 (reduced from default)

## Prerequisites

### Server Requirements
- Docker and Docker Compose installed
- Domain name with DNS configured
- SSL certificates (self-signed or from certificate authority)
- **Minimum**: AWS t3.micro (1GB RAM, 1 vCPU) or equivalent
  - Supports ~10-20 concurrent users with current optimizations
  - For higher traffic, upgrade to t3.small or larger
- Minimum 20GB storage for data persistence

### Environment Setup
Your EC2 instance needs the following directory structure:

```
/path/to/daiily/
├── docker-compose.prod.yml
├── Dockerfile
├── entrypoint.sh
├── nginx.conf
├── ssl/
│   ├── cert.pem          # SSL certificate
│   └── key.pem           # SSL private key
├── .env                  # Environment variables (not in git)
├── src/
├── prisma/
└── ...
```

## Environment Variables

Create a `.env` file on your server with the following variables:

```env
# Database
POSTGRES_PASSWORD=your-secure-password

# NextAuth Configuration
NEXTAUTH_SECRET=your-secure-nextauth-secret
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
NEXTAUTH_URL=https://daiily.site

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Security
CSRF_SECRET=your-csrf-secret

# External Services
OPENAI_API_KEY=your-openai-api-key
RESEND_API_KEY=your-resend-api-key
```

### Important Notes
- **Never commit `.env` to version control**
- Use strong, unique secrets (minimum 32 characters)
- For OAuth providers:
  - Configure redirect URIs in Google Cloud Console: `https://daiily.site/api/auth/callback/google`
  - Configure redirect URIs in GitHub: `https://daiily.site/api/auth/callback/github`
- SSL certificates must match the domain name

## Deployment Steps

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url> /path/to/daiily
   cd /path/to/daiily
   ```

2. **Create SSL directory and certificates**:
   ```bash
   mkdir -p ssl
   # Copy your SSL certificate and key files
   # Or generate self-signed certificates:
   openssl req -x509 -newkey rsa:4096 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365
   ```

3. **Create and configure .env file**:
   ```bash
   cat > .env << 'EOF'
   POSTGRES_PASSWORD=your-secure-password
   NEXTAUTH_SECRET=your-secure-nextauth-secret
   JWT_SECRET=your-secure-jwt-secret
   SESSION_SECRET=your-secure-session-secret
   NEXTAUTH_URL=https://daiily.site
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   CSRF_SECRET=...
   OPENAI_API_KEY=...
   RESEND_API_KEY=...
   EOF
   ```

4. **Start the application**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Verify services are running**:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

### Updating the Application

1. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart services**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

The entrypoint script will automatically run database migrations.

## Database Management

### Automatic Migrations
Database schema migrations run automatically on container startup via the entrypoint script:
```bash
npx prisma db push --skip-generate
```

### Connection Pool Configuration
PostgreSQL is configured with `max_connections=20`. Ensure Prisma's connection pool doesn't exceed this:
```env
# In .env file, add connection_limit if needed
DATABASE_URL="postgresql://postgres:password@db:5432/daiily?schema=public&connection_limit=10"
```

### Manual Database Operations

**Connect to PostgreSQL**:
```bash
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d daiily
```

**View database logs**:
```bash
docker-compose -f docker-compose.prod.yml logs db
```

**Backup database**:
```bash
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres daiily > backup.sql
```

**Restore database**:
```bash
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres daiily < backup.sql
```

## Monitoring & Troubleshooting

### View Logs

**All services**:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

**App service only**:
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

**Database service only**:
```bash
docker-compose -f docker-compose.prod.yml logs -f db
```

**Nginx service only**:
```bash
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Common Issues

**Issue: Account creation fails with "The table `public.users` does not exist"**
- The database migrations haven't run
- Check app logs: `docker-compose -f docker-compose.prod.yml logs app`
- Verify the database container is healthy and accepting connections
- Restart the app container: `docker-compose -f docker-compose.prod.yml restart app`

**Issue: SSL certificate errors**
- Verify SSL files exist at `./ssl/cert.pem` and `./ssl/key.pem`
- Check nginx logs: `docker-compose -f docker-compose.prod.yml logs nginx`
- For self-signed certificates, add to your OAuth provider's allowed domains

**Issue: OAuth redirects to wrong URL**
- Ensure `NEXTAUTH_URL` is set to your production domain
- Verify OAuth provider redirect URIs match exactly
- Restart app service: `docker-compose -f docker-compose.prod.yml restart app`

**Issue: Database connection refused**
- Check database container is running: `docker-compose -f docker-compose.prod.yml ps`
- Verify `POSTGRES_PASSWORD` matches in .env and docker-compose.prod.yml
- Check database logs: `docker-compose -f docker-compose.prod.yml logs db`

### Health Checks

The database service includes automatic health checks:
```bash
docker-compose -f docker-compose.prod.yml ps
```

Look for healthy status on the `db` service.

## Performance Optimization

### Docker & Build Optimization
- **Multi-stage builds**: Builder stage includes all dependencies, runner stage only includes production code
- **Alpine Linux**: Minimal base image (5MB) for smaller container sizes
- **Standalone output**: Next.js standalone mode reduces runtime dependencies
- **Heap memory limit**: 300MB restricts Node.js memory usage for t3.micro compatibility

### Image Optimization
- **Disabled image optimization** (`unoptimized: true` in next.config.ts) to reduce memory usage
- For production with more resources, enable image optimization
- PNG/JPEG compression can be handled by nginx or CDN if needed

### Nginx Optimization
- **Worker connections**: Limited to 256 (vs 1024 default) to reduce memory footprint
- **Keep-alive timeout**: 30 seconds (vs 60s) to free connections faster
- **Gzip compression**: Enabled on text/JSON responses (30-70% bandwidth reduction)
- **Static asset caching**: 1-year browser cache with immutable headers
- **Upstream connection reuse**: 2 persistent connections to app server

### Database Performance
- **PostgreSQL 16-alpine**: Minimal resource usage with optimized parameters
- **Shared buffers**: 32MB (suitable for t3.micro)
- **Effective cache size**: 128MB to help query planner
- **Work memory**: 2MB per operation
- **Max connections**: 20 (monitor and adjust based on usage)
- **Health checks**: Automatic with 30-second intervals

### Caching Strategy
- **Browser caching**: Static assets cached for 1 year with immutable flag
- **Next.js static optimization**: Prerendered pages served directly
- **Tailwind CSS v4**: Generates minimal CSS bundle with on-demand compilation

### Monitoring Performance
Monitor actual resource usage on t3.micro:
```bash
docker stats
docker-compose -f docker-compose.prod.yml logs -f
```

**Warning signs of resource exhaustion:**
- Container restarts frequently
- OOM (Out of Memory) errors in logs
- High CPU constantly at 100%
- Response times degrade under load

If experiencing issues, consider upgrading to t3.small or larger instance.

## Cost Optimization (AWS t3.micro)

This deployment is optimized for **AWS t3.micro** instances to minimize costs:

### Architecture Choices
- **Alpine-based containers**: Reduced image sizes (nginx: 41MB, postgres: 251MB, node: 188MB)
- **Minimal dependencies**: Production-only npm packages in final image
- **Resource limits**: Each service constrained to prevent runaway usage

### Cost Breakdown (Approximate)
- **t3.micro instance**: ~$4-6/month
- **EBS storage (20GB)**: ~$2/month
- **Data transfer**: ~$0.09/GB outbound
- **Total**: ~$6-8/month for small-scale deployment

### Scaling Guidelines
- **t3.micro**: Suitable for ~10-20 concurrent users, 100K-500K requests/day
- **t3.small**: For ~50-100 concurrent users, 1M+ requests/day
- **Beyond t3.small**: Consider managed services (RDS, Elastic Beanstalk, etc.)

### Key Optimizations in Place
1. **Gzip compression**: Reduces bandwidth costs by 30-70%
2. **Static asset caching**: Reduces server load and bandwidth
3. **Memory limits**: Prevents unexpected resource scaling
4. **Alpine Linux**: Smaller disk footprint
5. **Headless architecture**: API-first design reduces unnecessary data transfers

## Security Considerations

1. **HTTPS Only**: All traffic is redirected from HTTP to HTTPS via nginx
2. **Environment Variables**: Sensitive data is never committed to version control
3. **Database Isolation**: PostgreSQL runs in internal network, not exposed to the internet
4. **Session Security**: JWT-based sessions with secure cookies
5. **CSRF Protection**: Custom HMAC-SHA256 tokens for auth actions
6. **Content Security Policy**: Implemented via Next.js middleware
7. **Non-root user**: App runs as unprivileged `nextjs` user in Docker

## Scaling & Advanced Deployment

For production at scale, consider:

1. **Reverse Proxy Load Balancing**: Use AWS Load Balancer or similar
2. **Database Replication**: Set up PostgreSQL streaming replication
3. **Container Orchestration**: Migrate to Kubernetes for multi-instance deployments
4. **CDN Integration**: CloudFront or similar for static assets
5. **Monitoring**: Prometheus + Grafana for metrics
6. **Log Aggregation**: ELK stack or CloudWatch for centralized logging

## Maintenance

### Regular Tasks

**Daily**:
- Monitor application logs for errors
- Check health of services

**Weekly**:
- Review performance metrics
- Check for available updates to Docker base images

**Monthly**:
- Backup database
- Review security logs
- Test disaster recovery procedures

### Updates

To update the application with new code:

```bash
cd /path/to/daiily
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

The entrypoint script handles all database migrations automatically.

## Rollback Procedures

If a deployment causes issues:

1. **Identify the problematic commit**:
   ```bash
   git log --oneline -5
   ```

2. **Revert to previous commit**:
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Redeploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
