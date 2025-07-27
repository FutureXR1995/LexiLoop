# 🔐 GitHub Secrets 配置指南

## 📋 第一步：添加 GitHub Secrets

前往 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

逐一添加以下 Secrets：

### 数据库配置
```
Name: DATABASE_URL
Value: postgresql://lexiloopuser:ZhouYAO1995@lexiloop-jp-db-3507.postgres.database.azure.com:5432/lexiloop?sslmode=require
```

### 认证配置
```
Name: NEXTAUTH_SECRET
Value: 1OsE+l6lRe3b+hOyC64AECYIiwKf3SM8bJoHjv+voMs=
```

```
Name: NEXTAUTH_URL
Value: https://lexiloop-japan.azurestaticapps.net
```

### AI 和语音服务
```
Name: CLAUDE_API_KEY
Value: [您的Claude API密钥]
```

```
Name: AZURE_SPEECH_KEY
Value: [您的Azure Speech API密钥]
```

```
Name: AZURE_SPEECH_REGION
Value: japaneast
```

### 应用配置
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://lexiloop-japan.azurestaticapps.net
```

```
Name: NEXT_PUBLIC_DEFAULT_LOCALE
Value: ja-JP
```

### Azure 服务配置
```
Name: AZURE_KEYVAULT_URI
Value: https://lexiloop-jp-vault-3507.vault.azure.net/
```

```
Name: AZURE_CDN_PROFILE
Value: lexiloop-japan-cdn-3507
```

```
Name: AZURE_CDN_RESOURCE_GROUP
Value: lexiloop-japan-rg
```

## 📋 第二步：初始化数据库

在本地终端执行以下命令：

```bash
# 设置数据库连接
export DATABASE_URL="postgresql://lexiloopuser:ZhouYAO1995@lexiloop-jp-db-3507.postgres.database.azure.com:5432/lexiloop?sslmode=require"

# 推送数据库架构
npx prisma db push

# 运行种子数据
npx prisma db seed
```

## 📋 第三步：触发部署

1. 提交并推送代码到 main 分支：
```bash
git add .
git commit -m "配置生产环境部署

🚀 完成日本部署配置
✅ GitHub Secrets 已配置
✅ 数据库架构已推送
✅ 种子数据已初始化

🌏 目标用户: 日本人 + 在日华人 + 在日亚洲人
🎌 支持语言: 日语、中文、韩语等10种亚洲语言

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

2. 在 GitHub Actions 页面监控部署进度

## 📋 第四步：验证部署

部署完成后，访问以下地址验证：

1. **应用主页**: https://lexiloop-japan.azurestaticapps.net
2. **健康检查**: https://lexiloop-japan.azurestaticapps.net/api/health
3. **语言切换**: 测试日语、中文等多语言界面

## 🔍 常见问题排查

### 1. 部署失败
- 检查 GitHub Actions 日志
- 确认所有 Secrets 已正确添加
- 检查数据库连接是否正常

### 2. 数据库连接错误
```bash
# 测试数据库连接
npx prisma db push --preview-feature
```

### 3. API 密钥问题
- 确认 Key Vault 中的密钥是否正确
- 检查 API 密钥是否有效

## 🎉 部署成功标志

✅ GitHub Actions 显示绿色勾勾  
✅ 应用可以正常访问  
✅ 用户注册/登录功能正常  
✅ 多语言切换正常  
✅ AI 故事生成功能正常  
✅ 语音播放功能正常  

## 📞 需要帮助？

如果遇到问题，请检查：
1. Azure Portal 中的资源状态
2. GitHub Actions 的构建日志
3. 浏览器开发者工具的控制台错误

**恭喜！🎉 LexiLoop 现已在日本成功部署！**