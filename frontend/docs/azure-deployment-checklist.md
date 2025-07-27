# Azure 部署检查清单

## 前置准备 ✅

- [ ] Azure 订阅已激活
- [ ] Azure CLI 已安装并登录
- [ ] GitHub 仓库已创建并推送代码
- [ ] 本地开发环境测试通过

## Azure 资源创建

### 1. 运行自动化设置脚本
```bash
npm run azure:setup
```

### 2. 手动创建 Static Web Apps
1. 登录 [Azure Portal](https://portal.azure.com)
2. 创建资源 → Static Web Apps
3. 配置信息：
   - [ ] 资源组: `lexiloop-rg`
   - [ ] 名称: `lexiloop-app`
   - [ ] 计划类型: Free
   - [ ] GitHub 仓库已连接
   - [ ] 分支: `main`
   - [ ] 构建预设: Next.js
   - [ ] 应用位置: `/`
   - [ ] 输出位置: `out`

## GitHub Secrets 配置

在 GitHub 仓库设置 → Secrets and variables → Actions 中添加：

### 必需的 Secrets:
- [ ] `DATABASE_URL` - PostgreSQL 连接字符串
- [ ] `NEXTAUTH_SECRET` - 认证密钥 (32位随机字符串)
- [ ] `NEXTAUTH_URL` - 应用URL
- [ ] `CLAUDE_API_KEY` - Claude AI API 密钥
- [ ] `AZURE_SPEECH_KEY` - Azure 语音服务密钥
- [ ] `AZURE_SPEECH_REGION` - Azure 语音服务区域
- [ ] `NEXT_PUBLIC_SITE_URL` - 公开站点URL
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN` - SWA 部署令牌

### 可选的 Secrets:
- [ ] `AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING` - 应用洞察

## 数据库初始化

```bash
# 设置本地环境变量
export DATABASE_URL="你的Azure数据库连接字符串"

# 推送数据库架构
npm run azure:db:migrate

# 导入种子数据
npm run azure:db:seed
```

## 部署验证

### 1. 自动部署触发
- [ ] 推送代码到 main 分支
- [ ] GitHub Actions 构建成功
- [ ] Azure Static Web Apps 部署成功

### 2. 功能测试
- [ ] 网站可正常访问
- [ ] 用户注册/登录功能正常
- [ ] 数据库连接正常
- [ ] AI 功能正常 (Claude API)
- [ ] 语音功能正常 (Azure Speech)
- [ ] PWA 安装提示显示
- [ ] 移动端体验良好

### 3. 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] Lighthouse 性能评分 > 90
- [ ] Service Worker 缓存正常
- [ ] 离线功能正常

## 域名配置 (可选)

### 1. 自定义域名
- [ ] 在 Azure Static Web Apps 中添加自定义域
- [ ] 配置 DNS CNAME 记录
- [ ] SSL 证书自动配置

### 2. DNS 记录
```
类型: CNAME
名称: www (或您的子域)
值: lexiloop-app.azurestaticapps.net
```

## 监控设置

### 1. Application Insights
- [ ] 创建 Application Insights 资源
- [ ] 配置连接字符串
- [ ] 验证遥测数据收集

### 2. 告警规则
- [ ] 设置可用性告警
- [ ] 设置性能告警
- [ ] 设置错误率告警

## 安全配置

### 1. 安全头配置
- [ ] staticwebapp.config.json 已配置安全头
- [ ] CSP 策略已设置
- [ ] HTTPS 重定向已启用

### 2. 密钥管理
- [ ] 所有敏感信息存储在 Azure Key Vault
- [ ] GitHub Secrets 已正确配置
- [ ] 生产环境不暴露调试信息

## 备份策略

### 1. 数据库备份
- [ ] Azure PostgreSQL 自动备份已启用
- [ ] 备份保留期已设置 (建议7-30天)

### 2. 代码备份
- [ ] GitHub 仓库已设置
- [ ] 重要分支保护已启用

## 成本优化

### 1. 资源规模
- [ ] PostgreSQL 使用适当的计算级别
- [ ] 监控资源使用情况
- [ ] 设置预算告警

### 2. 预估成本
- Static Web Apps: 免费
- PostgreSQL (B1ms): ~$15/月
- Application Insights: ~$1/月
- **总计约 $16/月**

## 故障排除

### 常见问题检查:
- [ ] 检查 GitHub Actions 构建日志
- [ ] 检查 Azure 部署日志
- [ ] 验证环境变量配置
- [ ] 测试数据库连接
- [ ] 验证 API 密钥有效性

### 调试工具:
- [ ] Azure Portal 监控面板
- [ ] GitHub Actions 日志
- [ ] 浏览器开发者工具
- [ ] Application Insights 分析

## 后续优化

### 性能优化:
- [ ] 配置 CDN
- [ ] 优化图片加载
- [ ] 启用缓存策略
- [ ] 代码分割优化

### 功能扩展:
- [ ] 添加更多 AI 模型支持
- [ ] 实现实时通知
- [ ] 添加社交功能
- [ ] 多语言支持

---

## 快速命令参考

```bash
# 1. 创建 Azure 资源
npm run azure:setup

# 2. 初始化数据库
npm run azure:db:migrate
npm run azure:db:seed

# 3. 本地构建测试
npm run build

# 4. 部署到生产环境
git push origin main

# 5. 查看部署状态
# 访问 GitHub Actions 页面查看构建状态
```

---

**✅ 部署完成后，您的 LexiLoop 应用将在 Azure 上运行，具备高可用性、自动扩展和全球 CDN 加速！**