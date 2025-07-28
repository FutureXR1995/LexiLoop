# LexiLoop Azure 部署配置

## 🔐 GitHub Secrets 配置

请在 GitHub 仓库设置中添加以下 Secrets (Settings → Secrets and variables → Actions → New repository secret)：

### 必需的环境变量：

```bash
DATABASE_URL=postgresql://lexiloopuser:ZhouYAO1995@lexiloop-db-server.postgres.database.azure.com:5432/lexiloop?sslmode=require

NEXTAUTH_SECRET=1OsE+l6lRe3b+hOyC64AECYIiwKf3SM8bJoHjv+voMs=

NEXTAUTH_URL=https://lexiloop.azurestaticapps.net

CLAUDE_API_KEY=[您的Claude API密钥]

AZURE_SPEECH_KEY=[您的Azure Speech API密钥]

AZURE_SPEECH_REGION=japaneast

NEXT_PUBLIC_SITE_URL=https://lexiloop.azurestaticapps.net

# 这个将在创建 Static Web Apps 后获得
AZURE_STATIC_WEB_APPS_API_TOKEN=(将在Azure Portal中获取)
```

## 🚀 Azure 资源创建命令

### 1. 创建资源组
```bash
az group create --name lexiloop-rg --location "Japan East"
```

### 2. 创建 PostgreSQL 数据库
```bash
az postgres flexible-server create \
  --resource-group lexiloop-rg \
  --name lexiloop-db-server \
  --location "Japan East" \
  --admin-user lexiloopuser \
  --admin-password "ZhouYAO1995" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --public-access 0.0.0.0
```

### 3. 创建数据库
```bash
az postgres flexible-server db create \
  --resource-group lexiloop-rg \
  --server-name lexiloop-db-server \
  --database-name lexiloop
```

### 4. 创建 Key Vault
```bash
az keyvault create \
  --resource-group lexiloop-rg \
  --name lexiloop-keyvault \
  --location "Japan East"
```

### 5. 添加密钥到 Key Vault
```bash
az keyvault secret set --vault-name lexiloop-keyvault --name "Claude-API-Key" --value "[您的Claude API密钥]"

az keyvault secret set --vault-name lexiloop-keyvault --name "Azure-Speech-Key" --value "[您的Azure Speech API密钥]"

az keyvault secret set --vault-name lexiloop-keyvault --name "NextAuth-Secret" --value "1OsE+l6lRe3b+hOyC64AECYIiwKf3SM8bJoHjv+voMs="
```

## 🌐 Azure Static Web Apps 创建步骤

1. 登录 [Azure Portal](https://portal.azure.com)
2. 点击 "创建资源"
3. 搜索 "Static Web Apps" 并选择
4. 配置信息：
   - **资源组**: lexiloop-rg
   - **名称**: lexiloop
   - **计划类型**: Free
   - **区域**: East Asia
   - **部署详细信息**: GitHub
   - **GitHub 帐户**: 登录您的 GitHub 账户
   - **组织**: 选择您的 GitHub 用户名
   - **存储库**: 选择 LexiLoop 仓库
   - **分支**: main
   - **构建预设**: Next.js
   - **应用位置**: /
   - **API 位置**: (留空)
   - **输出位置**: out

5. 点击 "审阅 + 创建"，然后点击 "创建"

## 📋 自定义域名配置

创建 Static Web Apps 后：

1. 在 Azure Portal 中打开您的 Static Web Apps 资源
2. 在左侧菜单中选择 "自定义域"
3. 点击 "添加" → "自定义域 on Azure DNS" 或 "自定义域 on 其他 DNS"
4. 输入域名: `lexiloop.com` 和 `www.lexiloop.com`
5. 按照提示配置 DNS 记录

## 🗄️ 数据库初始化

创建完 Azure 资源后，运行以下命令初始化数据库：

```bash
# 设置环境变量
export DATABASE_URL="postgresql://lexiloopuser:ZhouYAO1995@lexiloop-db-server.postgres.database.azure.com:5432/lexiloop?sslmode=require"

# 推送数据库架构
npx prisma db push

# 运行种子数据
npx prisma db seed
```

## 🔄 部署流程

1. **配置 GitHub Secrets** (使用上面提供的值)
2. **创建 Azure 资源** (运行上面的 Azure CLI 命令)
3. **获取 SWA 部署令牌**:
   - 在 Azure Portal 中找到您的 Static Web Apps 资源
   - 转到 "概述" 页面
   - 点击 "管理部署令牌"
   - 复制令牌并添加到 GitHub Secrets 中的 `AZURE_STATIC_WEB_APPS_API_TOKEN`

4. **初始化数据库** (运行上面的数据库命令)
5. **推送代码到 main 分支**，自动触发部署

## ✅ 验证清单

部署完成后，请验证：

- [ ] 网站可访问: https://lexiloop.azurestaticapps.net
- [ ] 用户注册/登录功能正常
- [ ] AI 故事生成功能正常 (Claude API)
- [ ] 语音播放功能正常 (Azure Speech)
- [ ] PWA 安装提示显示
- [ ] 移动端响应式设计正常
- [ ] 数据库连接和数据持久化正常

## 💰 预估成本 (按月)

- **Static Web Apps**: 免费 (100GB 带宽)
- **PostgreSQL (B1ms)**: ~¥100
- **Key Vault**: ~¥7
- **Application Insights**: ~¥7 (可选)

**总计**: ~¥114/月

## 🆘 故障排除

如果遇到问题：

1. 检查 GitHub Actions 构建日志
2. 查看 Azure Portal 中的部署日志
3. 验证所有环境变量是否正确设置
4. 确认数据库连接字符串正确
5. 检查 API 密钥是否有效

## 📞 支持

如需帮助，请查看：
- [Azure Static Web Apps 文档](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Prisma 部署文档](https://www.prisma.io/docs/guides/deployment)