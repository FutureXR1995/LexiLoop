#!/bin/bash

# LexiLoop Azure 资源一键创建脚本
# 使用您提供的配置信息自动创建所有 Azure 资源

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始创建 LexiLoop Azure 资源...${NC}"

# 检查 Azure CLI
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI 未安装。请先安装 Azure CLI。${NC}"
    exit 1
fi

# 检查登录状态
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  未登录 Azure。正在启动登录流程...${NC}"
    az login
fi

# 配置变量
RESOURCE_GROUP="lexiloop-rg"
LOCATION="Japan East"
DB_SERVER_NAME="lexiloop-db-server"
DB_NAME="lexiloop"
DB_USER="lexiloopuser"
DB_PASSWORD="ZhouYAO1995"
KEYVAULT_NAME="lexiloop-keyvault"
APP_INSIGHTS_NAME="lexiloop-insights"

# Claude API 密钥
CLAUDE_API_KEY="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"

# Azure Speech 密钥
AZURE_SPEECH_KEY="ee9dKLY1XRCaGagb2pM8gBKOCXpbRHja6paIVBdbEIXq8bcOvGbrJQQJ99BGACYeBjFXJ3w3AAAYACOGiAEC"

# NextAuth 密钥
NEXTAUTH_SECRET="1OsE+l6lRe3b+hOyC64AECYIiwKf3SM8bJoHjv+voMs="

echo -e "${GREEN}✅ 使用以下配置：${NC}"
echo "资源组: $RESOURCE_GROUP"
echo "位置: $LOCATION"
echo "数据库服务器: $DB_SERVER_NAME"
echo "数据库名称: $DB_NAME"
echo "数据库用户: $DB_USER"
echo

# 1. 创建资源组
echo -e "${BLUE}📦 创建资源组...${NC}"
az group create --name $RESOURCE_GROUP --location "$LOCATION" --output table

# 2. 创建 PostgreSQL 数据库
echo -e "${BLUE}🗄️  创建 PostgreSQL 数据库服务器...${NC}"
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location "$LOCATION" \
  --admin-user $DB_USER \
  --admin-password "$DB_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --public-access 0.0.0.0 \
  --output table

# 3. 创建数据库
echo -e "${BLUE}🗄️  创建应用数据库...${NC}"
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME \
  --output table

# 4. 创建 Key Vault
echo -e "${BLUE}🔐 创建 Key Vault...${NC}"
az keyvault create \
  --resource-group $RESOURCE_GROUP \
  --name $KEYVAULT_NAME \
  --location "$LOCATION" \
  --output table

# 5. 添加密钥到 Key Vault
echo -e "${BLUE}🔑 添加 API 密钥到 Key Vault...${NC}"
az keyvault secret set --vault-name $KEYVAULT_NAME --name "Claude-API-Key" --value "$CLAUDE_API_KEY"
az keyvault secret set --vault-name $KEYVAULT_NAME --name "Azure-Speech-Key" --value "$AZURE_SPEECH_KEY"
az keyvault secret set --vault-name $KEYVAULT_NAME --name "NextAuth-Secret" --value "$NEXTAUTH_SECRET"

# 6. 创建 Application Insights
echo -e "${BLUE}📊 创建 Application Insights...${NC}"
az monitor app-insights component create \
  --resource-group $RESOURCE_GROUP \
  --app $APP_INSIGHTS_NAME \
  --location "$LOCATION" \
  --application-type web \
  --output table

# 7. 获取连接信息
echo -e "${BLUE}📋 获取连接信息...${NC}"

DB_HOST="${DB_SERVER_NAME}.postgres.database.azure.com"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"

# Application Insights 连接字符串
APP_INSIGHTS_KEY=$(az monitor app-insights component show --resource-group $RESOURCE_GROUP --app $APP_INSIGHTS_NAME --query instrumentationKey -o tsv)

echo -e "${GREEN}✅ 所有 Azure 资源创建完成！${NC}"
echo
echo -e "${YELLOW}📋 GitHub Secrets 配置信息：${NC}"
echo
echo "DATABASE_URL=$DATABASE_URL"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "NEXTAUTH_URL=https://lexiloop.azurestaticapps.net"
echo "CLAUDE_API_KEY=$CLAUDE_API_KEY"
echo "AZURE_SPEECH_KEY=$AZURE_SPEECH_KEY"
echo "AZURE_SPEECH_REGION=japaneast"
echo "NEXT_PUBLIC_SITE_URL=https://lexiloop.azurestaticapps.net"
echo "AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING=InstrumentationKey=$APP_INSIGHTS_KEY"
echo
echo -e "${BLUE}📝 下一步操作：${NC}"
echo "1. 在 Azure Portal 中创建 Static Web Apps 资源并连接 GitHub 仓库"
echo "2. 获取 Static Web Apps 部署令牌并添加到 GitHub Secrets"
echo "3. 将上述所有环境变量添加到 GitHub Secrets"
echo "4. 运行数据库初始化："
echo "   export DATABASE_URL=\"$DATABASE_URL\""
echo "   npx prisma db push"
echo "   npx prisma db seed"
echo "5. 推送代码到 main 分支触发自动部署"
echo
echo -e "${GREEN}🎉 Azure 资源准备完成！现在可以开始部署了。${NC}"