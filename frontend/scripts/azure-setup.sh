#!/bin/bash

# Azure LexiLoop 部署设置脚本
# 此脚本自动创建 Azure 资源并配置部署环境

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始 LexiLoop Azure 部署设置...${NC}"

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
LOCATION="East Asia"
DB_SERVER_NAME="lexiloop-db-server"
DB_NAME="lexiloop"
DB_USER="lexiloopuser"
KEYVAULT_NAME="lexiloop-keyvault"
APP_INSIGHTS_NAME="lexiloop-insights"

# 提示用户输入数据库密码
echo -e "${YELLOW}📝 请输入数据库管理员密码（至少8个字符，包含大小写字母和数字）：${NC}"
read -s DB_PASSWORD

# 验证密码强度
if [[ ${#DB_PASSWORD} -lt 8 ]]; then
    echo -e "${RED}❌ 密码太短，至少需要8个字符${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 密码已设置${NC}"

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

# 5. 创建 Application Insights
echo -e "${BLUE}📊 创建 Application Insights...${NC}"
az monitor app-insights component create \
  --resource-group $RESOURCE_GROUP \
  --app $APP_INSIGHTS_NAME \
  --location "$LOCATION" \
  --application-type web \
  --output table

# 6. 获取连接信息
echo -e "${BLUE}📋 获取连接信息...${NC}"

DB_HOST="${DB_SERVER_NAME}.postgres.database.azure.com"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"

# Application Insights 连接字符串
APP_INSIGHTS_KEY=$(az monitor app-insights component show --resource-group $RESOURCE_GROUP --app $APP_INSIGHTS_NAME --query instrumentationKey -o tsv)

echo -e "${GREEN}✅ Azure 资源创建完成！${NC}"
echo -e "${YELLOW}📝 请将以下信息添加到 GitHub Secrets 中：${NC}"
echo
echo "DATABASE_URL=$DATABASE_URL"
echo "AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING=InstrumentationKey=$APP_INSIGHTS_KEY"
echo
echo -e "${BLUE}🔗 Key Vault 信息：${NC}"
echo "Key Vault 名称: $KEYVAULT_NAME"
echo "Key Vault URI: https://${KEYVAULT_NAME}.vault.azure.net/"
echo
echo -e "${YELLOW}⚠️  重要提示：${NC}"
echo "1. 请在 Azure Portal 中创建 Static Web Apps 资源"
echo "2. 将 GitHub Secrets 中的 AZURE_STATIC_WEB_APPS_API_TOKEN 设置为 SWA 令牌"
echo "3. 运行数据库迁移: npx prisma db push"
echo "4. 运行种子数据: npx prisma db seed"
echo
echo -e "${GREEN}🎉 设置完成！您现在可以部署应用了。${NC}"