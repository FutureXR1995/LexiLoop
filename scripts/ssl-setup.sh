#!/bin/bash

# SSL Certificate Setup Script for LexiLoop Production
# This script helps set up SSL certificates using Let's Encrypt

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN=${1:-"lexiloop.com"}
EMAIL=${2:-"admin@lexiloop.com"}

echo -e "${BLUE}🔒 SSL Certificate Setup for LexiLoop${NC}"
echo -e "${BLUE}Domain: $DOMAIN${NC}"
echo -e "${BLUE}Email: $EMAIL${NC}"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing certbot...${NC}"
    
    # Detect OS and install certbot
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y certbot python3-certbot-nginx
        # CentOS/RHEL
        elif command -v yum &> /dev/null; then
            sudo yum install -y certbot python3-certbot-nginx
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install certbot
        else
            echo -e "${RED}❌ Please install Homebrew first or install certbot manually${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Unsupported OS. Please install certbot manually${NC}"
        exit 1
    fi
fi

# Stop nginx to free up port 80
echo -e "${BLUE}🛑 Stopping nginx temporarily...${NC}"
docker-compose -f docker-compose.prod.yml stop nginx

# Generate certificates
echo -e "${BLUE}🔒 Generating SSL certificates...${NC}"

# Method 1: Standalone (when nginx is stopped)
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    -d "api.$DOMAIN" \
    -d "ai.$DOMAIN" \
    --expand

# Copy certificates to nginx directory
echo -e "${BLUE}📋 Copying certificates to nginx directory...${NC}"

CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
NGINX_SSL_PATH="./nginx/ssl"

# Create nginx ssl directory if it doesn't exist
mkdir -p "$NGINX_SSL_PATH"

# Copy certificates for each domain
sudo cp "$CERT_PATH/fullchain.pem" "$NGINX_SSL_PATH/$DOMAIN.crt"
sudo cp "$CERT_PATH/privkey.pem" "$NGINX_SSL_PATH/$DOMAIN.key"

sudo cp "$CERT_PATH/fullchain.pem" "$NGINX_SSL_PATH/api.$DOMAIN.crt"
sudo cp "$CERT_PATH/privkey.pem" "$NGINX_SSL_PATH/api.$DOMAIN.key"

sudo cp "$CERT_PATH/fullchain.pem" "$NGINX_SSL_PATH/ai.$DOMAIN.crt"
sudo cp "$CERT_PATH/privkey.pem" "$NGINX_SSL_PATH/ai.$DOMAIN.key"

# Set proper permissions
sudo chown $USER:$USER "$NGINX_SSL_PATH"/*
chmod 644 "$NGINX_SSL_PATH"/*.crt
chmod 600 "$NGINX_SSL_PATH"/*.key

# Start nginx again
echo -e "${BLUE}🚀 Starting nginx with SSL certificates...${NC}"
docker-compose -f docker-compose.prod.yml start nginx

# Set up automatic renewal
echo -e "${BLUE}🔄 Setting up automatic certificate renewal...${NC}"

# Create renewal script
cat > "./scripts/renew-ssl.sh" << 'EOF'
#!/bin/bash

# Automatic SSL Certificate Renewal Script

DOMAIN=$1
NGINX_SSL_PATH="./nginx/ssl"

echo "Starting SSL certificate renewal process..."

# Stop nginx
docker-compose -f docker-compose.prod.yml stop nginx

# Renew certificates
certbot renew --quiet

# Copy renewed certificates
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

cp "$CERT_PATH/fullchain.pem" "$NGINX_SSL_PATH/$DOMAIN.crt"
cp "$CERT_PATH/privkey.pem" "$NGINX_SSL_PATH/$DOMAIN.key"

cp "$CERT_PATH/fullchain.pem" "$NGINX_SSL_PATH/api.$DOMAIN.crt"
cp "$CERT_PATH/privkey.pem" "$NGINX_SSL_PATH/api.$DOMAIN.key"

cp "$CERT_PATH/fullchain.pem" "$NGINX_SSL_PATH/ai.$DOMAIN.crt"
cp "$CERT_PATH/privkey.pem" "$NGINX_SSL_PATH/ai.$DOMAIN.key"

# Set proper permissions
chmod 644 "$NGINX_SSL_PATH"/*.crt
chmod 600 "$NGINX_SSL_PATH"/*.key

# Restart nginx
docker-compose -f docker-compose.prod.yml start nginx

echo "SSL certificate renewal completed successfully!"
EOF

chmod +x "./scripts/renew-ssl.sh"

# Add cron job for automatic renewal (runs every 12 hours)
(crontab -l 2>/dev/null; echo "0 */12 * * * /path/to/lexiloop/scripts/renew-ssl.sh $DOMAIN >> /var/log/ssl-renewal.log 2>&1") | crontab -

# Test SSL configuration
echo -e "${BLUE}🧪 Testing SSL configuration...${NC}"
sleep 5

if curl -f -I "https://$DOMAIN" &> /dev/null; then
    echo -e "${GREEN}✅ SSL certificate for $DOMAIN is working!${NC}"
else
    echo -e "${RED}❌ SSL certificate test failed for $DOMAIN${NC}"
fi

if curl -f -I "https://api.$DOMAIN/health" &> /dev/null; then
    echo -e "${GREEN}✅ SSL certificate for api.$DOMAIN is working!${NC}"
else
    echo -e "${RED}❌ SSL certificate test failed for api.$DOMAIN${NC}"
fi

echo ""
echo -e "${GREEN}🎉 SSL setup completed successfully!${NC}"
echo ""
echo -e "${GREEN}Certificate details:${NC}"
echo -e "${GREEN}Domain: $DOMAIN${NC}"
echo -e "${GREEN}Certificate path: $CERT_PATH${NC}"
echo -e "${GREEN}Expiry: $(openssl x509 -enddate -noout -in "$CERT_PATH/cert.pem" | cut -d= -f2)${NC}"
echo ""
echo -e "${GREEN}📝 Important notes:${NC}"
echo -e "${GREEN}1. Certificates will auto-renew via cron job${NC}"
echo -e "${GREEN}2. Check renewal with: certbot certificates${NC}"
echo -e "${GREEN}3. Test renewal with: certbot renew --dry-run${NC}"
echo -e "${GREEN}4. Monitor expiry dates regularly${NC}"
echo ""
echo -e "${BLUE}🔍 To check SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN${NC}"