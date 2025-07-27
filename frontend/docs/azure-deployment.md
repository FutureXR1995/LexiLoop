# Azure 部署指南

本指南详细说明如何将 LexiLoop 应用部署到 Microsoft Azure 云平台。

## 架构概览

- **前端**: Azure Static Web Apps (Next.js 静态导出)
- **数据库**: Azure Database for PostgreSQL
- **存储**: Azure Blob Storage (图片、文件)
- **密钥管理**: Azure Key Vault
- **CI/CD**: GitHub Actions

## 第一步：创建 Azure 资源

### 1. Azure Database for PostgreSQL

```bash
# 创建资源组
az group create --name lexiloop-rg --location "East Asia"

# 创建 PostgreSQL 服务器
az postgres flexible-server create \
  --resource-group lexiloop-rg \
  --name lexiloop-db-server \
  --location "East Asia" \
  --admin-user lexiloopuser \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --public-access 0.0.0.0

# 创建数据库
az postgres flexible-server db create \
  --resource-group lexiloop-rg \
  --server-name lexiloop-db-server \
  --database-name lexiloop
```

### 2. Azure Static Web Apps

1. 登录 Azure Portal
2. 创建新资源 -> Static Web Apps
3. 配置：
   - 资源组: lexiloop-rg
   - 名称: lexiloop-app
   - 计划类型: Free
   - 部署详细信息: GitHub
   - 仓库: 选择您的 GitHub 仓库
   - 分支: main
   - 构建预设: Next.js
   - 应用位置: /
   - API 位置: (留空)
   - 输出位置: out

### 3. Azure Key Vault (可选，用于安全存储密钥)

```bash
# 创建 Key Vault
az keyvault create \
  --resource-group lexiloop-rg \
  --name lexiloop-keyvault \
  --location "East Asia"

# 添加密钥
az keyvault secret set --vault-name lexiloop-keyvault --name "Claude-API-Key" --value "your-claude-api-key"
az keyvault secret set --vault-name lexiloop-keyvault --name "Azure-Speech-Key" --value "your-azure-speech-key"
```

## 第二步：配置环境变量

在 GitHub 仓库设置中添加以下 Secrets：

```
DATABASE_URL=postgresql://lexiloopuser:YourSecurePassword123!@lexiloop-db-server.postgres.database.azure.com:5432/lexiloop?sslmode=require
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://lexiloop-app.azurestaticapps.net
CLAUDE_API_KEY=your-claude-api-key
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=eastasia
NEXT_PUBLIC_SITE_URL=https://lexiloop-app.azurestaticapps.net
AZURE_STATIC_WEB_APPS_API_TOKEN=your-azure-swa-token
```

## 第三步：数据库初始化

```bash
# 本地连接到 Azure 数据库
export DATABASE_URL="postgresql://lexiloopuser:YourSecurePassword123!@lexiloop-db-server.postgres.database.azure.com:5432/lexiloop?sslmode=require"

# 推送数据库架构
npx prisma db push

# 运行种子数据
npx prisma db seed
```

## 第四步：自定义域名配置 (可选)

1. 在 Azure Static Web Apps 中，转到"自定义域"
2. 添加您的域名
3. 配置 DNS 记录：
   - 类型: CNAME
   - 名称: www (或您的子域)
   - 值: lexiloop-app.azurestaticapps.net

## 第五步：监控和日志

### Application Insights 集成

```bash
# 创建 Application Insights
az monitor app-insights component create \
  --resource-group lexiloop-rg \
  --app lexiloop-insights \
  --location "East Asia" \
  --application-type web
```

### 性能监控

- 使用 Azure Monitor 监控应用性能
- 设置告警规则
- 配置日志分析

## 成本估算

### 免费层资源：
- Azure Static Web Apps: 免费 (100GB 带宽/月)
- Azure Database for PostgreSQL: ~$15/月 (B1ms)
- Azure Key Vault: ~$1/月 (小用量)

### 总成本: ~$16/月

## 安全最佳实践

1. **数据库安全**:
   - 启用 SSL 连接
   - 配置防火墙规则
   - 定期备份

2. **应用安全**:
   - 使用 HTTPS
   - 配置安全头
   - 定期更新依赖

3. **密钥管理**:
   - 使用 Azure Key Vault
   - 定期轮换密钥
   - 最小权限原则

## 故障排除

### 常见问题：

1. **构建失败**: 检查环境变量配置
2. **数据库连接失败**: 验证连接字符串和防火墙规则
3. **静态资源 404**: 检查 next.config.js 配置

### 调试工具：

- Azure Portal 日志
- GitHub Actions 日志
- 浏览器开发者工具
- Prisma Studio

## 部署检查清单

- [ ] Azure 资源已创建
- [ ] GitHub Secrets 已配置
- [ ] 数据库架构已推送
- [ ] 种子数据已导入
- [ ] 自动部署流程已测试
- [ ] 自定义域名已配置 (可选)
- [ ] 监控已设置
- [ ] 安全配置已完成

## 后续优化

1. **CDN 优化**: 配置 Azure CDN
2. **缓存策略**: 优化静态资源缓存
3. **图片优化**: 使用 Azure Blob Storage + CDN
4. **数据库优化**: 连接池、索引优化
5. **监控告警**: 设置性能和错误告警