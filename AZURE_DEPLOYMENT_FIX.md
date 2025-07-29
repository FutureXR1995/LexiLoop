# Azure Static Web Apps 部署修复指南

## 问题
`The app build failed to produce artifact folder: 'out'`

## 解决方案

### 1. 在Azure Portal中更新工作流配置
如果使用Azure Portal的自动配置，需要确保以下设置：

```yaml
app_location: "frontend"
api_location: "api"  
output_location: "out"
data_api_location: "swa-db-connections"
```

### 2. 手动更新GitHub Actions工作流
如果你有访问GitHub Actions的权限，请在 `.github/workflows/azure-static-web-apps.yml` 中确保：

```yaml
- name: Deploy to Azure Static Web Apps
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    repo_token: ${{ secrets.GITHUB_TOKEN }}
    action: "upload"
    app_location: "frontend"           # Next.js应用位置
    api_location: "api"                # Azure Functions位置
    output_location: "out"             # Next.js静态导出输出文件夹
    data_api_location: "swa-db-connections"  # 数据库配置文件夹
    app_build_command: "npm run build"
```

### 3. 验证构建配置
确保 `frontend/next.config.js` 包含：
```javascript
const nextConfig = {
  output: 'export',  // 生成静态文件到out文件夹
  trailingSlash: true,
  images: { 
    unoptimized: true  // 静态导出需要禁用图片优化
  }
}
```

### 4. 环境变量配置
在Azure Static Web Apps的Configuration中添加：
```
DATABASE_URL=postgresql://ZHOUYAO:ZhouYao159967606@lexiloop-jp-db-3507.postgres.database.azure.com:5432/postgres?sslmode=require
NEXTAUTH_SECRET=your-32-character-random-string
NEXTAUTH_URL=https://white-glacier-006c28d00.1.azurestaticapps.net
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=eastus
NEXT_PUBLIC_SITE_URL=https://white-glacier-006c28d00.1.azurestaticapps.net
```

## 数据库配置文件位置
为确保Azure能找到数据库配置，已在多个位置创建配置文件：
- ✅ `/swa-db-connections/staticwebapp.database.config.json` (推荐位置)
- ✅ `/staticwebapp.database.config.json` (根目录备用)
- ✅ `/database-connections/staticwebapp.database.config.json` (替代位置)

## 如果仍显示"缺少数据库连接配置文件"
1. **在Azure Portal检查部署日志**
   - 确认文件是否被正确部署
   - 查看是否有配置错误

2. **手动触发重新部署**
   - 在GitHub仓库中进行一个小的更改并推送
   - 或在Azure Portal中点击"重新部署"

3. **检查工作流配置**
   - 确保 `data_api_location` 参数设置正确
   - 默认应该是 "swa-db-connections"

## 修复优先级
1. ✅ Next.js配置已修复 (output: 'export', distDir: 'out')
2. ✅ 删除有问题的环境变量文件
3. ✅ 构建成功生成 frontend/out/ 文件夹
4. ✅ 数据库配置文件已创建在多个位置
5. ⏳ 需要在Azure Portal或GitHub中更新workflow配置
6. ⏳ 需要添加环境变量到Azure Configuration

## 构建验证
- ✅ 本地构建成功
- ✅ out 文件夹生成在正确位置 (frontend/out/)
- ✅ 包含所有静态页面和资源文件