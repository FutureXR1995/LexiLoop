#!/bin/bash

# LexiLoop Backup Script
# Automated backup solution for database and application data

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Database settings
DB_CONTAINER="lexiloop-postgres"
DB_NAME=${POSTGRES_DB:-lexiloop}
DB_USER=${POSTGRES_USER:-lexiloop}

# Redis settings
REDIS_CONTAINER="lexiloop-redis"

echo -e "${BLUE}📦 Starting LexiLoop Backup Process${NC}"
echo -e "${BLUE}Timestamp: $TIMESTAMP${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# Function to check if container is running
check_container() {
    if ! docker ps --format "table {{.Names}}" | grep -q "^$1$"; then
        echo -e "${RED}❌ Container $1 is not running${NC}"
        exit 1
    fi
}

# Backup PostgreSQL database
echo -e "${BLUE}🗄️  Backing up PostgreSQL database...${NC}"
check_container "$DB_CONTAINER"

docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --clean --no-owner --no-privileges > "$BACKUP_DIR/$TIMESTAMP/postgres_backup.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PostgreSQL backup completed${NC}"
    # Compress the backup
    gzip "$BACKUP_DIR/$TIMESTAMP/postgres_backup.sql"
    echo -e "${GREEN}✅ PostgreSQL backup compressed${NC}"
else
    echo -e "${RED}❌ PostgreSQL backup failed${NC}"
    exit 1
fi

# Backup Redis data
echo -e "${BLUE}🔄 Backing up Redis data...${NC}"
check_container "$REDIS_CONTAINER"

# Create Redis backup
docker exec "$REDIS_CONTAINER" redis-cli --rdb /data/dump_backup.rdb
docker cp "$REDIS_CONTAINER:/data/dump_backup.rdb" "$BACKUP_DIR/$TIMESTAMP/redis_backup.rdb"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Redis backup completed${NC}"
    # Compress the backup
    gzip "$BACKUP_DIR/$TIMESTAMP/redis_backup.rdb"
    echo -e "${GREEN}✅ Redis backup compressed${NC}"
else
    echo -e "${RED}❌ Redis backup failed${NC}"
fi

# Backup application configuration
echo -e "${BLUE}⚙️  Backing up configuration files...${NC}"

# Create config backup directory
mkdir -p "$BACKUP_DIR/$TIMESTAMP/config"

# Backup important config files
cp .env "$BACKUP_DIR/$TIMESTAMP/config/" 2>/dev/null || echo -e "${YELLOW}⚠️  .env file not found${NC}"
cp docker-compose.prod.yml "$BACKUP_DIR/$TIMESTAMP/config/"
cp -r nginx/ssl "$BACKUP_DIR/$TIMESTAMP/config/" 2>/dev/null || echo -e "${YELLOW}⚠️  SSL certificates not found${NC}"

# Backup user uploads (if any)
if [ -d "uploads" ]; then
    echo -e "${BLUE}📎 Backing up user uploads...${NC}"
    cp -r uploads "$BACKUP_DIR/$TIMESTAMP/"
    echo -e "${GREEN}✅ Uploads backup completed${NC}"
fi

# Create backup metadata
echo -e "${BLUE}📝 Creating backup metadata...${NC}"

cat > "$BACKUP_DIR/$TIMESTAMP/backup_info.txt" << EOF
LexiLoop Backup Information
==========================

Backup Date: $(date)
Backup ID: $TIMESTAMP

Database Backup:
- PostgreSQL: postgres_backup.sql.gz
- Redis: redis_backup.rdb.gz

Configuration:
- Environment: .env
- Docker Compose: docker-compose.prod.yml
- SSL Certificates: ssl/

System Information:
- Docker Version: $(docker --version)
- Host: $(hostname)
- Disk Space: $(df -h .)

Backup Size: $(du -sh $BACKUP_DIR/$TIMESTAMP)
EOF

echo -e "${GREEN}✅ Backup metadata created${NC}"

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$TIMESTAMP" | cut -f1)
echo -e "${GREEN}📊 Backup size: $BACKUP_SIZE${NC}"

# Clean up old backups
echo -e "${BLUE}🧹 Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"

find "$BACKUP_DIR" -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -type d -name "20*" | wc -l)
echo -e "${GREEN}📊 Remaining backups: $REMAINING_BACKUPS${NC}"

# Optional: Upload to cloud storage
if [ ! -z "$AWS_S3_BUCKET" ] && command -v aws &> /dev/null; then
    echo -e "${BLUE}☁️  Uploading backup to S3...${NC}"
    
    # Create tar archive for upload
    tar -czf "$BACKUP_DIR/lexiloop_backup_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "$TIMESTAMP"
    
    # Upload to S3
    aws s3 cp "$BACKUP_DIR/lexiloop_backup_$TIMESTAMP.tar.gz" "s3://$AWS_S3_BUCKET/backups/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup uploaded to S3${NC}"
        # Remove local tar file after successful upload
        rm "$BACKUP_DIR/lexiloop_backup_$TIMESTAMP.tar.gz"
    else
        echo -e "${RED}❌ S3 upload failed${NC}"
    fi
fi

# Verify backup integrity
echo -e "${BLUE}🔍 Verifying backup integrity...${NC}"

# Check if backup files exist and are not empty
if [ -s "$BACKUP_DIR/$TIMESTAMP/postgres_backup.sql.gz" ]; then
    echo -e "${GREEN}✅ PostgreSQL backup file is valid${NC}"
else
    echo -e "${RED}❌ PostgreSQL backup file is invalid or empty${NC}"
fi

if [ -s "$BACKUP_DIR/$TIMESTAMP/redis_backup.rdb.gz" ]; then
    echo -e "${GREEN}✅ Redis backup file is valid${NC}"
else
    echo -e "${RED}❌ Redis backup file is invalid or empty${NC}"
fi

# Send notification (if configured)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ LexiLoop backup completed successfully\\nBackup ID: $TIMESTAMP\\nSize: $BACKUP_SIZE\"}" \
        "$SLACK_WEBHOOK_URL" &> /dev/null || echo -e "${YELLOW}⚠️  Slack notification failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Backup process completed successfully!${NC}"
echo ""
echo -e "${GREEN}Backup Details:${NC}"
echo -e "${GREEN}- Backup ID: $TIMESTAMP${NC}"
echo -e "${GREEN}- Location: $BACKUP_DIR/$TIMESTAMP${NC}"
echo -e "${GREEN}- Size: $BACKUP_SIZE${NC}"
echo -e "${GREEN}- Contains: Database, Redis, Config, SSL certificates${NC}"
echo ""
echo -e "${BLUE}📖 To restore from this backup, use: ./scripts/restore.sh $TIMESTAMP${NC}"
echo ""

# Create latest symlink
ln -sfn "$TIMESTAMP" "$BACKUP_DIR/latest"
echo -e "${GREEN}🔗 Latest backup symlink updated${NC}"