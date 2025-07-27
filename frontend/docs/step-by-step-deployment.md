# 📋 LexiLoop 部署操作指南 - 跟我一步步做！

## 🎯 第一步：配置 GitHub Secrets（5分钟）

### 1.1 打开 GitHub 仓库
1. 在浏览器中打开：https://github.com/FutureXR1995/LexiLoop
2. 点击仓库顶部的 **"Settings"** 标签

### 1.2 进入 Secrets 配置页面
1. 在左侧菜单中找到 **"Secrets and variables"**
2. 点击它，然后选择 **"Actions"**
3. 你会看到 "Repository secrets" 部分

### 1.3 添加第一个 Secret - 数据库连接
1. 点击 **"New repository secret"** 按钮
2. Name 填写：`DATABASE_URL`
3. Secret 填写：
```
postgresql://lexiloopuser:ZhouYAO1995@lexiloop-jp-db-3507.postgres.database.azure.com:5432/lexiloop?sslmode=require
```
4. 点击 **"Add secret"**

### 1.4 继续添加其他 Secrets
重复上面的步骤，依次添加以下 secrets：

**Secret 2 - 认证密钥：**
- Name: `NEXTAUTH_SECRET`
- Secret: `1OsE+l6lRe3b+hOyC64AECYIiwKf3SM8bJoHjv+voMs=`

**Secret 3 - 网站地址：**
- Name: `NEXTAUTH_URL`
- Secret: `https://lexiloop-japan.azurestaticapps.net`

**Secret 4 - Claude AI 密钥：**
- Name: `CLAUDE_API_KEY`
- Secret: `[您的Claude API密钥]`

**Secret 5 - Azure 语音密钥：**
- Name: `AZURE_SPEECH_KEY`
- Secret: `[您的Azure Speech API密钥]`

**Secret 6 - 语音区域：**
- Name: `AZURE_SPEECH_REGION`
- Secret: `japaneast`

**Secret 7 - 公开网站地址：**
- Name: `NEXT_PUBLIC_SITE_URL`
- Secret: `https://lexiloop-japan.azurestaticapps.net`

**Secret 8 - 默认语言：**
- Name: `NEXT_PUBLIC_DEFAULT_LOCALE`
- Secret: `ja-JP`

**Secret 9 - Key Vault 地址：**
- Name: `AZURE_KEYVAULT_URI`
- Secret: `https://lexiloop-jp-vault-3507.vault.azure.net/`

**Secret 10 - CDN 配置：**
- Name: `AZURE_CDN_PROFILE`
- Secret: `lexiloop-japan-cdn-3507`

**Secret 11 - CDN 资源组：**
- Name: `AZURE_CDN_RESOURCE_GROUP`
- Secret: `lexiloop-japan-rg`

✅ **完成后，你应该看到 11 个 secrets 已添加**

---

## 🚀 第二步：手动触发部署（2分钟）

### 2.1 进入 Actions 页面
1. 在 GitHub 仓库页面，点击顶部的 **"Actions"** 标签
2. 你会看到一个工作流列表

### 2.2 找到部署工作流
1. 在左侧工作流列表中，找到类似这样的名称：
   - `Azure Static Web Apps CI/CD`
   - 或者包含 `azure-static-web-apps` 的工作流
2. 点击这个工作流

### 2.3 手动运行部署
1. 在工作流页面右侧，你会看到 **"Run workflow"** 按钮
2. 点击 **"Run workflow"**
3. 确保分支选择是 **"main"**
4. 点击绿色的 **"Run workflow"** 按钮开始部署

### 2.4 监控部署进度
1. 页面会刷新，显示一个新的运行记录
2. 点击这个运行记录查看详细进度
3. 等待所有步骤显示绿色勾勾 ✅

**部署时间：通常需要 3-5 分钟**

---

## 🔍 第三步：验证部署结果（3分钟）

### 3.1 检查部署状态
1. 在 Actions 页面，确认最新的运行显示绿色勾勾
2. 如果有红色 ❌，点击查看错误日志

### 3.2 访问你的应用
打开浏览器，访问：**https://lexiloop-japan.azurestaticapps.net**

### 3.3 测试功能清单
请逐一测试以下功能：

- [ ] **页面加载**：首页能正常显示
- [ ] **语言切换**：点击语言选择器，切换到中文
- [ ] **用户注册**：尝试创建新账户
- [ ] **用户登录**：使用测试账户登录：
  - 邮箱：`test@lexiloop.com`
  - 密码：`password123`
- [ ] **多语言界面**：界面显示对应语言
- [ ] **响应式设计**：在手机上访问测试
- [ ] **PWA功能**：浏览器提示安装应用

---

## ❗ 常见问题解决

### 问题1：Secrets 添加不成功
**解决方法：**
- 确保 Secret 名字完全匹配（区分大小写）
- 确保 Secret 值没有多余的空格
- 重新复制粘贴 Secret 值

### 问题2：部署失败（红色 ❌）
**解决方法：**
1. 点击失败的运行记录
2. 展开错误的步骤
3. 查看错误信息
4. 常见错误：
   - 数据库连接失败 → 检查 `DATABASE_URL`
   - API 密钥错误 → 检查 `CLAUDE_API_KEY`

### 问题3：网站无法访问
**解决方法：**
1. 等待 5-10 分钟让 DNS 生效
2. 尝试清除浏览器缓存
3. 检查 Azure Static Web Apps 是否创建成功

### 问题4：功能不正常
**解决方法：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页的错误信息
3. 检查对应的 Secret 配置

---

## 🎉 部署成功标志

当你看到以下情况时，说明部署成功：

✅ **GitHub Actions 显示绿色勾勾**
✅ **网站可以正常访问**
✅ **用户可以注册和登录**
✅ **语言切换正常工作**
✅ **界面显示正确的语言**

---

## 📞 需要帮助？

如果遇到任何问题：

1. **截图发给我**：包括错误信息、页面状态
2. **提供详细描述**：在哪一步遇到问题
3. **检查清单**：确认每个步骤都正确完成

**恭喜！🎉 完成这些步骤后，LexiLoop 就正式在日本部署上线了！**

你的应用现在可以为全球用户提供多语言AI词汇学习服务！