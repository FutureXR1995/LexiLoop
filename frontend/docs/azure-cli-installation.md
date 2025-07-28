# Azure CLI 安装和部署指南

## 🔧 Azure CLI 安装方法

### macOS 安装 (推荐)
```bash
# 使用 Homebrew 安装 (最简单)
brew install azure-cli

# 或者使用官方安装脚本
curl -L https://aka.ms/InstallAzureCli | bash

# 验证安装
az --version
```

### 其他系统安装方法

#### Ubuntu/Debian
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

#### Windows
```powershell
# 使用 winget
winget install Microsoft.AzureCLI

# 或者下载 MSI 安装包
# https://aka.ms/installazurecliwindows
```

#### 通用方法 (Python pip)
```bash
pip install azure-cli
```

## 🚀 安装完成后的部署步骤

### 第一步：登录 Azure
```bash
# 登录您的 Azure 账户
az login

# 验证登录状态
az account show

# 如果有多个订阅，选择正确的订阅
az account list --output table
az account set --subscription "您的订阅ID"
```

### 第二步：执行日本部署脚本
```bash
# 运行我们准备好的日本部署脚本
./scripts/japan-deployment.sh
```

### 第三步：手动部署替代方案

如果脚本执行有问题，您也可以手动执行以下命令：

#### 1. 创建资源组
```bash
az group create --name lexiloop-japan-rg --location "Japan East"
```

#### 2. 创建 PostgreSQL 数据库
```bash
az postgres flexible-server create \
  --resource-group lexiloop-japan-rg \
  --name lexiloop-jp-db \
  --location "Japan East" \
  --admin-user lexiloopuser \
  --admin-password "ZhouYAO1995" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --public-access 0.0.0.0
```

#### 3. 创建应用数据库
```bash
az postgres flexible-server db create \
  --resource-group lexiloop-japan-rg \
  --server-name lexiloop-jp-db \
  --database-name lexiloop
```

#### 4. 创建 Key Vault
```bash
az keyvault create \
  --resource-group lexiloop-japan-rg \
  --name lexiloop-jp-vault \
  --location "Japan East"
```

#### 5. 添加密钥到 Key Vault
```bash
# Claude API 密钥
az keyvault secret set \
  --vault-name lexiloop-jp-vault \
  --name "Claude-API-Key" \
  --value "[您的Claude API密钥]"

# Azure Speech 密钥
az keyvault secret set \
  --vault-name lexiloop-jp-vault \
  --name "Azure-Speech-Key" \
  --value "[您的Azure Speech API密钥]"

# NextAuth 密钥
az keyvault secret set \
  --vault-name lexiloop-jp-vault \
  --name "NextAuth-Secret" \
  --value "1OsE+l6lRe3b+hOyC64AECYIiwKf3SM8bJoHjv+voMs="
```

#### 6. 创建 Application Insights
```bash
az monitor app-insights component create \
  --resource-group lexiloop-japan-rg \
  --app lexiloop-jp-insights \
  --location "Japan East" \
  --application-type web
```

## 📋 GitHub Secrets 配置

部署完成后，请将以下信息添加到 GitHub Secrets：

```bash
DATABASE_URL=postgresql://lexiloopuser:ZhouYAO1995@lexiloop-jp-db.postgres.database.azure.com:5432/lexiloop?sslmode=require

NEXTAUTH_SECRET=1OsE+l6lRe3b+hOyC64AECYIiwKf3SM8bJoHjv+voMs=

NEXTAUTH_URL=https://lexiloop-japan.azurestaticapps.net

CLAUDE_API_KEY=[您的Claude API密钥]

AZURE_SPEECH_KEY=[您的Azure Speech API密钥]

AZURE_SPEECH_REGION=japaneast

NEXT_PUBLIC_SITE_URL=https://lexiloop-japan.azurestaticapps.net

NEXT_PUBLIC_DEFAULT_LOCALE=ja-JP

# 这个需要在创建 Static Web Apps 后获取
AZURE_STATIC_WEB_APPS_API_TOKEN=(将在Azure Portal中获取)
```

## 🌐 Azure Portal 操作

### 创建 Static Web Apps

1. 登录 [Azure Portal](https://portal.azure.com)
2. 点击 "创建资源"
3. 搜索 "Static Web Apps"
4. 配置信息：
   - **资源组**: lexiloop-japan-rg
   - **名称**: lexiloop-japan
   - **计划类型**: Free
   - **区域**: Japan East
   - **GitHub 账户**: 连接您的 GitHub
   - **存储库**: 选择 LexiLoop 仓库
   - **分支**: main
   - **构建预设**: Next.js
   - **应用位置**: /
   - **输出位置**: out

5. 创建完成后，获取部署令牌并添加到 GitHub Secrets

## 🗄️ 数据库初始化

```bash
# 设置数据库连接
export DATABASE_URL="postgresql://lexiloopuser:ZhouYAO1995@lexiloop-jp-db.postgres.database.azure.com:5432/lexiloop?sslmode=require"

# 推送数据库架构
npx prisma db push

# 运行种子数据
npx prisma db seed
```

## ✅ 部署验证清单

- [ ] Azure CLI 已安装并登录
- [ ] 资源组 lexiloop-japan-rg 已创建
- [ ] PostgreSQL 数据库 lexiloop-jp-db 已创建
- [ ] Key Vault lexiloop-jp-vault 已创建并存储密钥
- [ ] Application Insights 已创建
- [ ] Static Web Apps 已创建并连接 GitHub
- [ ] GitHub Secrets 已配置完成
- [ ] 数据库架构已推送
- [ ] 种子数据已导入
- [ ] 应用可以正常访问

## 🛠️ 故障排除

### 常见问题：

1. **权限问题**: 确保您的 Azure 账户有创建资源的权限
2. **资源名称冲突**: 如果名称已被使用，尝试添加随机后缀
3. **网络连接**: 确保网络连接稳定
4. **防火墙规则**: 检查数据库防火墙设置

### 获取帮助：

- Azure 支持: [Azure 支持中心](https://azure.microsoft.com/support/)
- 命令参考: `az --help` 或 `az [command] --help`
- 官方文档: [Azure CLI 文档](https://docs.microsoft.com/cli/azure/)

完成这些步骤后，您的 LexiLoop 应用将在 Azure Japan East 区域运行，为日本和亚洲用户提供最佳的性能体验！