# CI/CD Deployment Guide

This document explains how to set up and use the automated deployment workflow for Daiily.

## Workflow Overview

The deployment workflow (`.github/workflows/deploy.yml`) automates three main steps:

1. **Build**: Checkout code and build Docker image
2. **Push**: Upload Docker image to GitHub Container Registry (GHCR)
3. **Deploy**: SSH into Lightsail server and run deployment commands

## Prerequisites

### 1. Lightsail Server Setup

Your Lightsail server should have:

- Docker and Docker Compose installed
- Project directory at `~/daiily`
- `.env` file with required environment variables
- `docker-compose.prod.yml` in the project directory
- SSH access configured

### 2. GitHub Repository Settings

Configure the following secrets in your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `LIGHTSAIL_HOST` | Your Lightsail server IP or domain | `123.45.67.89` or `daiily.example.com` |
| `LIGHTSAIL_USERNAME` | SSH username | `ubuntu` or `ec2-user` |
| `LIGHTSAIL_SSH_KEY` | Private SSH key for authentication | `-----BEGIN RSA PRIVATE KEY-----\n...` |

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions - no setup needed.

## How to Get SSH Key

If you don't have an SSH key for your Lightsail server:

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"

# Copy the private key
cat ~/.ssh/id_rsa
# Paste this into LIGHTSAIL_SSH_KEY secret

# Copy the public key to your Lightsail server
ssh-copy-id -i ~/.ssh/id_rsa.pub username@your-server-ip
```

## Workflow Triggers

The deployment workflow runs:

- **Automatically**: When code is pushed to the `main` branch
- **Manually**: Via GitHub Actions UI (workflow_dispatch)

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Deploy to AWS Lightsail** workflow
3. Click **Run workflow** → Select branch → **Run workflow**

## Workflow Steps Explained

### Job 1: Build and Push

1. **Checkout code**: Downloads repository code
2. **Set up Docker Buildx**: Enables advanced Docker build features
3. **Log in to GHCR**: Authenticates with GitHub Container Registry
4. **Extract metadata**: Creates image tags (latest, branch name, commit SHA)
5. **Build and push**: Builds Docker image and uploads to GHCR with caching

### Job 2: Deploy

1. **SSH to Lightsail**: Connects to your server
2. **Login to GHCR**: Authenticates Docker to pull private images
3. **Pull latest image**: Downloads the newly built image
4. **Stop containers**: Gracefully stops running containers
5. **Start containers**: Launches new containers with updated image
6. **Cleanup**: Removes old Docker images to save disk space
7. **Health check**: Shows container status and recent logs

## Server Directory Structure

Your Lightsail server should have:

```
~/daiily/
├── docker-compose.prod.yml    # Production compose file
├── nginx.conf                  # Nginx configuration
├── ssl/                        # SSL certificates (if using HTTPS)
│   ├── certificate.crt
│   └── private.key
├── .env                        # Environment variables
└── backups/                    # Database backups (auto-created)
```

## Required Environment Variables on Server

Your `~/daiily/.env` file should contain:

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# Next.js
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

# Email (if using)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...
```

## Monitoring Deployment

### Check Workflow Status

1. Go to **Actions** tab
2. Click on the latest workflow run
3. View logs for each job

### Check Server Status

SSH into your Lightsail server:

```bash
ssh username@your-server-ip
cd ~/daiily

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f db
```

## Troubleshooting

### Build Fails

- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check build logs in GitHub Actions

### Push Fails

- Verify GitHub token permissions
- Check if GHCR is enabled for your repository
- Ensure workflow has `packages: write` permission

### Deployment Fails

**SSH Connection Issues:**
```bash
# Test SSH connection locally
ssh -i ~/.ssh/your_key username@server-ip

# Verify SSH key format (should start with -----BEGIN)
# Remove any extra spaces or line breaks when pasting into GitHub secrets
```

**Docker Pull Issues:**
```bash
# On server, manually test pull
docker pull ghcr.io/yourusername/daiily:latest

# Check if logged in to GHCR
docker login ghcr.io -u yourusername
```

**Container Start Issues:**
```bash
# Check if ports are available
sudo lsof -i :80
sudo lsof -i :443

# View detailed error logs
docker-compose -f docker-compose.prod.yml logs
```

### Database Migration Issues

If migrations fail:

```bash
# SSH to server
cd ~/daiily

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Manually run migrations
docker-compose -f docker-compose.prod.yml run --rm app sh -c "prisma migrate deploy"

# Restart containers
docker-compose -f docker-compose.prod.yml up -d
```

## Rollback Procedure

If deployment breaks the application:

```bash
# SSH to server
cd ~/daiily

# List available images
docker images | grep daiily

# Update docker-compose.prod.yml to use specific SHA tag
# Change: image: ghcr.io/username/daiily:latest
# To: image: ghcr.io/username/daiily:main-abc1234

# Restart with old image
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Performance Optimization

### Build Cache

The workflow uses GitHub Actions cache to speed up builds:
- Layer caching reduces build time by ~50%
- Cache is automatically managed (no manual cleanup needed)

### Resource Limits

Production compose file includes resource limits suitable for t3.micro:
- App: 400MB RAM, 0.5 CPU
- Nginx: 50MB RAM, 0.2 CPU
- DB: 200MB RAM, 0.3 CPU

### Image Cleanup

Old images are automatically pruned after 24 hours to save disk space:
```bash
docker image prune -af --filter "until=24h"
```

## Security Best Practices

1. **Never commit secrets**: Use GitHub Secrets for sensitive data
2. **Rotate SSH keys**: Periodically update SSH keys
3. **Use HTTPS**: Configure SSL certificates in nginx
4. **Limit SSH access**: Use SSH keys only (disable password auth)
5. **Regular updates**: Keep Docker and system packages updated

## Additional Features

### Slack Notifications (Optional)

Uncomment the Slack notification step in `deploy.yml` and add:

```yaml
secrets:
  SLACK_WEBHOOK: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Blue-Green Deployment (Advanced)

For zero-downtime deployments:

1. Run new containers on different ports
2. Test health endpoints
3. Switch nginx upstream
4. Stop old containers

## Support

For issues with:
- **GitHub Actions**: Check Actions tab logs
- **Docker**: View container logs on server
- **Application**: Check Next.js logs in container

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS Lightsail Guide](https://lightsail.aws.amazon.com/ls/docs)
