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
   - Run database migrations

4. **Web Server Configuration**
   - Configure Nginx reverse proxy
   - Obtain SSL certificate
   - Enable HTTPS redirect

### Update Process

1. Pull latest code
2. Rebuild containers: `docker compose up -d --build`
3. Run migrations if needed
4. Verify deployment

## Key Components

### Dockerfile
Multi-stage build:
- Dependencies installation
- Prisma generation
- Next.js build (standalone output)
- Minimal production runtime

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

## Maintenance

- **Backups**: Daily PostgreSQL dumps via cron
- **Logs**: Docker logs + Nginx logs
- **Updates**: Git pull + container rebuild
- **SSL**: Auto-renewal via Certbot

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
