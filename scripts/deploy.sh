#!/bin/bash

# LexiLoop Production Deployment Script
# This script deploys LexiLoop with HTTPS support

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"lexiloop.com"}
API_DOMAIN="api.$DOMAIN"
AI_DOMAIN="ai.$DOMAIN"
STAGING=${2:-false}

echo -e "${BLUE}🚀 Starting LexiLoop Production Deployment${NC}"
echo -e "${BLUE}Domain: $DOMAIN${NC}"
echo -e "${BLUE}API Domain: $API_DOMAIN${NC}"
echo -e "${BLUE}AI Domain: $AI_DOMAIN${NC}"
echo ""

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        echo -e "${YELLOW}⚠️  No .env file found. Copying from .env.production${NC}"
        cp .env.production .env
        echo -e "${RED}🔧 Please edit .env file with your actual configuration values${NC}"
        echo -e "${RED}Press Enter to continue after editing .env file...${NC}"
        read
    else
        echo -e "${RED}❌ No .env file found. Please create one based on .env.production${NC}"
        exit 1
    fi
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p database/backups
mkdir -p monitoring
mkdir -p logs

# Generate SSL certificates if they don't exist
if [ ! -f "nginx/ssl/$DOMAIN.crt" ]; then
    echo -e "${BLUE}🔒 Generating SSL certificates...${NC}"
    
    if [ "$STAGING" = "true" ]; then
        echo -e "${YELLOW}⚠️  Using self-signed certificates for staging${NC}"
        ./nginx/generate-ssl.sh
    else
        echo -e "${GREEN}🔒 For production, please install real SSL certificates${NC}"
        echo -e "${GREEN}Recommended: Use Let's Encrypt with certbot${NC}"
        echo -e "${GREEN}Command: certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN -d $AI_DOMAIN${NC}"
        echo ""
        echo -e "${YELLOW}For now, generating self-signed certificates...${NC}"
        ./nginx/generate-ssl.sh
    fi
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Pull latest images
echo -e "${BLUE}📥 Pulling latest images...${NC}"
docker-compose -f docker-compose.prod.yml pull

# Build services
echo -e "${BLUE}🏗️  Building services...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"

# Check nginx
if curl -f -k https://localhost/health &> /dev/null; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
fi

# Check API
if curl -f -k https://localhost/api/health &> /dev/null; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
fi

# Check AI service
if curl -f -k https://localhost:8001/health &> /dev/null; then
    echo -e "${GREEN}✅ AI Service is healthy${NC}"
else
    echo -e "${RED}❌ AI Service health check failed${NC}"
fi

# Check database
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready &> /dev/null; then
    echo -e "${GREEN}✅ Database is healthy${NC}"
else
    echo -e "${RED}❌ Database health check failed${NC}"
fi

# Check Redis
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis health check failed${NC}"
fi

# Show running containers
echo -e "${BLUE}📋 Running containers:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Show service URLs
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}Service URLs:${NC}"
echo -e "${GREEN}Frontend: https://$DOMAIN${NC}"
echo -e "${GREEN}API: https://$API_DOMAIN${NC}"
echo -e "${GREEN}AI Service: https://$AI_DOMAIN${NC}"
echo -e "${GREEN}Monitoring: http://localhost:3001 (Grafana)${NC}"
echo -e "${GREEN}Metrics: http://localhost:9090 (Prometheus)${NC}"
echo ""

if [ "$STAGING" = "true" ]; then
    echo -e "${YELLOW}⚠️  This is a staging deployment with self-signed certificates${NC}"
    echo -e "${YELLOW}You may see security warnings in your browser${NC}"
    echo ""
fi

echo -e "${GREEN}📝 Next steps:${NC}"
echo -e "${GREEN}1. Update your DNS records to point to this server${NC}"
echo -e "${GREEN}2. Install real SSL certificates for production${NC}"
echo -e "${GREEN}3. Configure monitoring alerts${NC}"
echo -e "${GREEN}4. Set up automated backups${NC}"
echo -e "${GREEN}5. Configure log rotation${NC}"
echo ""

echo -e "${BLUE}📊 To view logs: docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "${BLUE}🔄 To restart: docker-compose -f docker-compose.prod.yml restart${NC}"
echo -e "${BLUE}🛑 To stop: docker-compose -f docker-compose.prod.yml down${NC}"