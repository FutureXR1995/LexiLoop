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

## 修复优先级
1. ✅ Next.js配置已修复 (output: 'export')
2. ⏳ 需要在Azure Portal或GitHub中更新workflow配置
3. ⏳ 需要添加环境变量到Azure Configuration