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
- **Image**: Built from local Dockerfile
- **Environment**: Production (NODE_ENV=production)
- **Port**: 3000 (internal only, exposed via nginx)
- **Startup**: Automatic database migrations via entrypoint script
- **Restart Policy**: unless-stopped

### 2. **Nginx Service** (Reverse Proxy)
- **Image**: nginx:alpine
- **Ports**:
  - 80 (HTTP → HTTPS redirect)
  - 443 (HTTPS with SSL/TLS)
- **Configuration**: ./nginx.conf
- **SSL Certificates**: ./ssl/cert.pem and ./ssl/key.pem
- **Restart Policy**: unless-stopped

### 3. **Database Service** (PostgreSQL)
- **Image**: postgres:16-alpine
- **Port**: 5432 (internal only)
- **Version**: PostgreSQL 16
- **Data**: Persistent volume (postgres_data)
- **Health Checks**: Automatic with pg_isready
- **Restart Policy**: unless-stopped

## Prerequisites

### Server Requirements
- Docker and Docker Compose installed
- Domain name with DNS configured
- SSL certificates (self-signed or from certificate authority)
- At least 2GB RAM, 20GB storage

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

### Image Optimization
- Next.js images are optimized via `next/image`
- PNG/JPEG compression is handled automatically

### Database Performance
- PostgreSQL 16-alpine provides efficient resource usage
- Indexes are created via Prisma schema
- Connection pooling can be configured in DATABASE_URL if needed

### Caching
- Next.js static optimization
- Browser caching via nginx headers
- Tailwind CSS v4 produces minimal CSS bundle

## Security Considerations

1. **HTTPS Only**: All traffic is redirected from HTTP to HTTPS via nginx
2. **Environment Variables**: Sensitive data is never committed to version control
3. **Database Isolation**: PostgreSQL runs in internal network, not exposed to the internet
4. **Session Security**: JWT-based sessions with secure cookies
5. **CSRF Protection**: Custom HMAC-SHA256 tokens for auth actions
6. **Content Security Policy**: Implemented via Next.js middleware

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
