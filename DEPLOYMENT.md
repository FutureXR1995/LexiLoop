# LexiLoop HTTPS Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying LexiLoop with HTTPS support, SSL certificates, and production-ready security configurations.

## Architecture

```
Internet
    ↓
Nginx (SSL Termination + Reverse Proxy)
    ↓
┌─────────────┬─────────────┬─────────────┐
│  Frontend   │   Backend   │ AI Service  │
│   (Next.js) │  (Node.js)  │  (Python)   │
│    :3000    │    :8000    │    :8001    │
└─────────────┴─────────────┴─────────────┘
    ↓                ↓
┌─────────────┬─────────────┐
│ PostgreSQL  │    Redis    │
│    :5432    │    :6379    │
└─────────────┴─────────────┘
```

## Quick Start

### 1. Prerequisites

- Docker and Docker Compose installed
- Domain name configured to point to your server
- Ports 80 and 443 open on your server
- At least 4GB RAM and 2 CPU cores recommended

### 2. Environment Setup

```bash
# Clone the repository
git clone https://github.com/FutureXR1995/LexiLoop.git
cd LexiLoop

# Copy environment template
cp .env.production .env

# Edit environment variables
nano .env
```

### 3. Deploy with HTTPS

```bash
# Deploy with staging certificates (for testing)
./scripts/deploy.sh your-domain.com staging

# Deploy with production certificates
./scripts/deploy.sh your-domain.com production
```

### 4. Setup SSL Certificates

For production, use Let's Encrypt:

```bash
# Setup SSL certificates
./scripts/ssl-setup.sh your-domain.com admin@your-domain.com
```

## Detailed Configuration

### Environment Variables

Key variables to configure in `.env`:

```bash
# Database
POSTGRES_PASSWORD=your_secure_database_password
REDIS_PASSWORD=your_secure_redis_password

# Security
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters

# External APIs
OPENAI_API_KEY=your_openai_api_key
AZURE_SPEECH_KEY=your_azure_speech_service_key

# Domain Configuration
DOMAIN=your-domain.com
```

### SSL Certificate Management

#### Option 1: Let's Encrypt (Recommended for Production)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Setup SSL certificates
./scripts/ssl-setup.sh your-domain.com admin@your-domain.com

# Automatic renewal is configured via cron job
```

#### Option 2: Custom Certificates

```bash
# Place your certificates in nginx/ssl/
nginx/ssl/
├── your-domain.com.crt
├── your-domain.com.key
├── api.your-domain.com.crt
├── api.your-domain.com.key
├── ai.your-domain.com.crt
└── ai.your-domain.com.key
```

### Security Configuration

#### Nginx Security Headers

- **HSTS**: Forces HTTPS for all connections
- **CSP**: Content Security Policy to prevent XSS
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing

#### Rate Limiting

- API endpoints: 10 requests/second
- Authentication: 5 requests/second
- File uploads: 2 requests/second

#### Network Security

- All services run in isolated Docker network
- Database and Redis not exposed to internet
- Read-only containers where possible
- Non-root users in containers

## Monitoring and Maintenance

### Health Checks

All services include health checks:

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View service logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service
docker-compose -f docker-compose.prod.yml logs frontend
```

### Monitoring Stack

Included monitoring services:

- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Dashboards and alerting (port 3001)
- **Loki**: Log aggregation (port 3100)

Access monitoring:
- Grafana: `http://your-server:3001` (admin/admin_secure_password)
- Prometheus: `http://your-server:9090`

### Backup and Recovery

#### Automated Backups

```bash
# Run manual backup
./scripts/backup.sh

# Setup automated daily backups
crontab -e
# Add: 0 2 * * * /path/to/LexiLoop/scripts/backup.sh
```

#### Backup Contents

- PostgreSQL database dump
- Redis data
- SSL certificates
- Configuration files
- User uploads (if any)

#### Restore from Backup

```bash
# List available backups
ls backups/

# Restore from specific backup
./scripts/restore.sh 20240126_143022
```

## Performance Optimization

### Frontend Optimization

- Static file caching (1 year)
- Gzip compression
- Image optimization
- Code splitting and lazy loading

### Backend Optimization

- Connection pooling
- Redis caching
- Query optimization
- Rate limiting

### Database Optimization

- Optimized PostgreSQL configuration
- Connection pooling
- Query performance monitoring
- Regular VACUUM and ANALYZE

## Troubleshooting

### Common Issues

#### SSL Certificate Errors

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/your-domain.com.crt -text -noout

# Test SSL configuration
curl -I https://your-domain.com

# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

#### Service Connection Issues

```bash
# Check service connectivity
docker-compose -f docker-compose.prod.yml exec nginx curl backend:8000/health
docker-compose -f docker-compose.prod.yml exec nginx curl ai-service:8001/health

# Check database connection
docker-compose -f docker-compose.prod.yml exec backend npm run db:test
```

#### Performance Issues

```bash
# Monitor resource usage
docker stats

# Check application logs
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# Database performance
docker-compose -f docker-compose.prod.yml exec postgres pg_stat_activity
```

### Log Analysis

#### Application Logs

```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Filter by service
docker-compose -f docker-compose.prod.yml logs backend | grep ERROR

# Export logs
docker-compose -f docker-compose.prod.yml logs --since="1h" > app.log
```

#### Nginx Access Logs

```bash
# View access logs
tail -f nginx/logs/access.log

# Analyze traffic patterns
grep "404" nginx/logs/access.log | wc -l
```

## Scaling and High Availability

### Horizontal Scaling

```bash
# Scale frontend service
docker-compose -f docker-compose.prod.yml up -d --scale frontend=3

# Scale backend service
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

### Load Balancing

Update nginx.conf to add multiple upstream servers:

```nginx
upstream backend {
    server backend:8000;
    server backend2:8000;
    server backend3:8000;
}
```

### Database Replication

For high availability, consider PostgreSQL streaming replication or managed database services.

## Security Best Practices

### Regular Security Updates

```bash
# Update base images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Update system packages
sudo apt update && sudo apt upgrade
```

### Security Monitoring

- Monitor failed authentication attempts
- Track unusual traffic patterns
- Set up intrusion detection
- Regular security audits

### Access Control

- Use strong passwords
- Enable 2FA where possible
- Limit SSH access
- Regular access reviews

## Production Checklist

- [ ] Domain DNS configured
- [ ] SSL certificates installed
- [ ] Environment variables set
- [ ] Backup system configured
- [ ] Monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Log rotation configured
- [ ] Health checks working
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Documentation updated

## Support and Resources

### Useful Commands

```bash
# View all containers
docker ps -a

# Check disk usage
df -h

# Monitor system resources
htop

# Test network connectivity
curl -I https://api.your-domain.com/health

# Backup database manually
./scripts/backup.sh

# Restart all services
docker-compose -f docker-compose.prod.yml restart
```

### Configuration Files

- `docker-compose.prod.yml`: Production Docker Compose
- `nginx/nginx.conf`: Nginx configuration
- `.env`: Environment variables
- `scripts/deploy.sh`: Deployment script
- `scripts/ssl-setup.sh`: SSL setup script

### Monitoring URLs

- Frontend: `https://your-domain.com`
- API: `https://api.your-domain.com/health`
- AI Service: `https://ai.your-domain.com/health`
- Monitoring: `http://your-server:3001` (Grafana)

For additional support, check the project repository or create an issue on GitHub.