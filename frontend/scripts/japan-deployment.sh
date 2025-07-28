#!/bin/bash

# LexiLoop 日本部署专用脚本
# 针对日本市场优化的 Azure 资源创建脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗾 LexiLoop 日本部署开始...${NC}"
echo -e "${PURPLE}目标用户: 日本人 + 在日华人 + 在日亚洲人${NC}"

# 检查 Azure CLI
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI 未安装。请先安装 Azure CLI。${NC}"
    echo -e "${YELLOW}安装命令: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash${NC}"
    exit 1
fi

# 检查登录状态
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  未登录 Azure。正在启动登录流程...${NC}"
    az login
fi

# 显示当前账户信息
ACCOUNT_NAME=$(az account show --query name -o tsv)
echo -e "${GREEN}✅ 已登录 Azure 账户: $ACCOUNT_NAME${NC}"

# 日本专用配置变量
RANDOM_SUFFIX=$(date +%s | tail -c 5)
RESOURCE_GROUP="lexiloop-japan-rg"
LOCATION="Japan East"
DB_SERVER_NAME="lexiloop-jp-db-${RANDOM_SUFFIX}"
DB_NAME="lexiloop"
DB_USER="lexiloopuser"
DB_PASSWORD="ZhouYAO1995"
KEYVAULT_NAME="lexiloop-jp-vault-${RANDOM_SUFFIX}"
APP_INSIGHTS_NAME="lexiloop-jp-insights-${RANDOM_SUFFIX}"
CDN_PROFILE_NAME="lexiloop-japan-cdn-${RANDOM_SUFFIX}"

# API 密钥配置 (使用现有密钥)
CLAUDE_API_KEY="[您的Claude API密钥]"
AZURE_SPEECH_KEY="[您的Azure Speech API密钥]"
NEXTAUTH_SECRET="1OsE+l6lRe3b+hOyC64AECYIiwKf3SM8bJoHjv+voMs="

echo -e "${BLUE}📋 使用以下日本优化配置：${NC}"
echo "🏢 资源组: $RESOURCE_GROUP"
echo "🌏 位置: $LOCATION (东京数据中心)"
echo "🗄️  数据库: $DB_SERVER_NAME"
echo "🔐 密钥库: $KEYVAULT_NAME"
echo "📊 监控: $APP_INSIGHTS_NAME"
echo "🚀 CDN: $CDN_PROFILE_NAME"
echo

# 1. 创建资源组
echo -e "${BLUE}📦 创建日本资源组...${NC}"
az group create \
  --name $RESOURCE_GROUP \
  --location "$LOCATION" \
  --tags environment=production region=japan market=asia \
  --output table

# 2. 创建 PostgreSQL 数据库 (日本优化)
echo -e "${BLUE}🗄️  创建日本 PostgreSQL 数据库...${NC}"
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
  --storage-auto-grow Enabled \
  --backup-retention 7 \
  --geo-redundant-backup Disabled \
  --high-availability Disabled \
  --public-access 0.0.0.0 \
  --tags environment=production region=japan \
  --output table

# 3. 创建应用数据库
echo -e "${BLUE}🗄️  创建应用数据库...${NC}"
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME \
  --output table

# 4. 配置数据库防火墙 (允许 Azure 服务)
echo -e "${BLUE}🔥 配置数据库防火墙规则...${NC}"
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --rule-name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0 \
  --output table

# 5. 创建 Key Vault (日本区域)
echo -e "${BLUE}🔐 创建日本 Key Vault...${NC}"
az keyvault create \
  --resource-group $RESOURCE_GROUP \
  --name $KEYVAULT_NAME \
  --location "$LOCATION" \
  --sku standard \
  --enable-soft-delete true \
  --retention-days 90 \
  --tags environment=production region=japan \
  --output table

# 6. 添加密钥到 Key Vault
echo -e "${BLUE}🔑 添加 API 密钥到 Key Vault...${NC}"
az keyvault secret set \
  --vault-name $KEYVAULT_NAME \
  --name "Claude-API-Key" \
  --value "$CLAUDE_API_KEY" \
  --description "Claude AI API Key for Japan deployment"

az keyvault secret set \
  --vault-name $KEYVAULT_NAME \
  --name "Azure-Speech-Key" \
  --value "$AZURE_SPEECH_KEY" \
  --description "Azure Speech Service Key for Japan East region"

az keyvault secret set \
  --vault-name $KEYVAULT_NAME \
  --name "NextAuth-Secret" \
  --value "$NEXTAUTH_SECRET" \
  --description "NextAuth secret for user authentication"

az keyvault secret set \
  --vault-name $KEYVAULT_NAME \
  --name "Database-Password" \
  --value "$DB_PASSWORD" \
  --description "PostgreSQL database password"

echo -e "${GREEN}✅ 密钥已安全存储到 Key Vault${NC}"

# 7. 创建 Application Insights (日本区域)
echo -e "${BLUE}📊 创建日本 Application Insights...${NC}"
az monitor app-insights component create \
  --resource-group $RESOURCE_GROUP \
  --app $APP_INSIGHTS_NAME \
  --location "$LOCATION" \
  --application-type web \
  --kind web \
  --tags environment=production region=japan \
  --output table

# 8. 创建 CDN Profile (日本优化)
echo -e "${BLUE}🚀 创建日本 CDN 配置...${NC}"
az cdn profile create \
  --resource-group $RESOURCE_GROUP \
  --name $CDN_PROFILE_NAME \
  --location "$LOCATION" \
  --sku Standard_Microsoft \
  --tags environment=production region=japan \
  --output table

# 9. 获取连接信息
echo -e "${BLUE}📋 获取部署信息...${NC}"

DB_HOST="${DB_SERVER_NAME}.postgres.database.azure.com"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"

# Application Insights 连接字符串
APP_INSIGHTS_KEY=$(az monitor app-insights component show \
  --resource-group $RESOURCE_GROUP \
  --app $APP_INSIGHTS_NAME \
  --query instrumentationKey -o tsv)

APP_INSIGHTS_CONNECTION=$(az monitor app-insights component show \
  --resource-group $RESOURCE_GROUP \
  --app $APP_INSIGHTS_NAME \
  --query connectionString -o tsv)

# Key Vault URI
KEYVAULT_URI="https://${KEYVAULT_NAME}.vault.azure.net/"

echo -e "${GREEN}🎉 日本 Azure 资源创建完成！${NC}"
echo
echo -e "${YELLOW}📝 请将以下信息添加到 GitHub Secrets 中：${NC}"
echo
echo "# 数据库配置"
echo "DATABASE_URL=$DATABASE_URL"
echo
echo "# 认证配置"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "NEXTAUTH_URL=https://lexiloop-japan.azurestaticapps.net"
echo
echo "# AI 和语音服务"
echo "CLAUDE_API_KEY=$CLAUDE_API_KEY"
echo "AZURE_SPEECH_KEY=$AZURE_SPEECH_KEY"
echo "AZURE_SPEECH_REGION=japaneast"
echo
echo "# 应用配置"
echo "NEXT_PUBLIC_SITE_URL=https://lexiloop-japan.azurestaticapps.net"
echo "NEXT_PUBLIC_DEFAULT_LOCALE=ja-JP"
echo
echo "# 监控配置"
echo "AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING=$APP_INSIGHTS_CONNECTION"
echo "AZURE_KEYVAULT_URI=$KEYVAULT_URI"
echo
echo "# CDN 配置"
echo "AZURE_CDN_PROFILE=$CDN_PROFILE_NAME"
echo "AZURE_CDN_RESOURCE_GROUP=$RESOURCE_GROUP"
echo
echo -e "${BLUE}🔗 重要资源信息：${NC}"
echo "Key Vault URI: $KEYVAULT_URI"
echo "数据库服务器: $DB_HOST"
echo "Application Insights Key: $APP_INSIGHTS_KEY"
echo "CDN Profile: $CDN_PROFILE_NAME"
echo
echo -e "${PURPLE}🎌 日本特色配置：${NC}"
echo "✅ 数据存储在日本东京"
echo "✅ 支持10种亚洲语言"
echo "✅ 优化日本用户延迟"
echo "✅ 企业级安全配置"
echo
echo -e "${YELLOW}📋 下一步操作：${NC}"
echo "1. 在 Azure Portal 中创建 Static Web Apps 资源"
echo "2. 连接 GitHub 仓库并配置自动部署"
echo "3. 将上述环境变量添加到 GitHub Secrets"
echo "4. 获取 Static Web Apps 部署令牌"
echo "5. 运行数据库初始化命令："
echo "   export DATABASE_URL=\"$DATABASE_URL\""
echo "   npx prisma db push"
echo "   npx prisma db seed"
echo "6. 推送代码到 main 分支触发部署"
echo "7. 考虑注册 .jp 域名用于日本市场"
echo
echo -e "${GREEN}🇯🇵 LexiLoop 日本部署资源准备完成！${NC}"
echo -e "${BLUE}🌸 頑張って！(加油！)${NC}"