#!/bin/bash

# SSL Certificate Generation Script for LexiLoop
# This script generates self-signed certificates for development
# In production, replace with real certificates from Let's Encrypt or a CA

set -e

SSL_DIR="/etc/nginx/ssl"
COUNTRY="US"
STATE="California"
CITY="San Francisco"
ORG="LexiLoop"
UNIT="IT Department"
EMAIL="admin@lexiloop.com"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

echo "Generating SSL certificates for LexiLoop..."

# Generate private key and certificate for main domain
echo "Generating certificate for lexiloop.com..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SSL_DIR/lexiloop.com.key \
    -out $SSL_DIR/lexiloop.com.crt \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$UNIT/CN=lexiloop.com/emailAddress=$EMAIL" \
    -addext "subjectAltName=DNS:lexiloop.com,DNS:www.lexiloop.com"

# Generate private key and certificate for API domain
echo "Generating certificate for api.lexiloop.com..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SSL_DIR/api.lexiloop.com.key \
    -out $SSL_DIR/api.lexiloop.com.crt \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$UNIT/CN=api.lexiloop.com/emailAddress=$EMAIL"

# Generate private key and certificate for AI service domain
echo "Generating certificate for ai.lexiloop.com..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SSL_DIR/ai.lexiloop.com.key \
    -out $SSL_DIR/ai.lexiloop.com.crt \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$UNIT/CN=ai.lexiloop.com/emailAddress=$EMAIL"

# Set proper permissions
chmod 600 $SSL_DIR/*.key
chmod 644 $SSL_DIR/*.crt

echo "SSL certificates generated successfully!"
echo "Certificates location: $SSL_DIR"
echo ""
echo "IMPORTANT: These are self-signed certificates for development only."
echo "For production, use certificates from a trusted CA like Let's Encrypt."
echo ""
echo "To trust these certificates in your browser:"
echo "1. Visit https://lexiloop.com"
echo "2. Click 'Advanced' when you see the security warning"
echo "3. Click 'Proceed to lexiloop.com (unsafe)'"
echo ""
echo "For Let's Encrypt certificates in production, run:"
echo "certbot --nginx -d lexiloop.com -d www.lexiloop.com -d api.lexiloop.com -d ai.lexiloop.com"