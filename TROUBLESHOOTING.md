# LexiLoop 故障排除指南

## 🔧 前端无法访问问题

### 当前状态
- ✅ 代码构建成功
- ✅ 服务器显示启动成功
- ❌ 浏览器无法访问页面

### 解决方案

#### 方案 1：使用生产构建
```bash
# 在 frontend 目录下
cd /Users/chow/Desktop/LexiLoop/frontend

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

#### 方案 2：重置开发环境
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 方案 3：使用简化的Next.js配置
```bash
# 创建临时的简化配置
mv next.config.js next.config.js.backup
echo "module.exports = {}" > next.config.js
npm run dev
```

#### 方案 4：使用静态导出模式
```bash
# 修改 next.config.js
echo "module.exports = { output: 'export', trailingSlash: true }" > next.config.js
npm run build
npx serve out -p 3000
```

### 直接访问方式

1. **静态文件访问**：
   - 打开文件管理器
   - 导航到 `/Users/chow/Desktop/LexiLoop/frontend/out/`
   - 双击 `index.html` 文件

2. **使用简单HTTP服务器**：
```bash
cd /Users/chow/Desktop/LexiLoop/frontend/out
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

### 验证页面

以下页面已经创建并可以访问：

- **主页**: `index.html`
- **管理页面**: `admin/index.html`
- **样式测试**: `style-test/index.html`
- **演示页面**: `demo/index.html`
- **学习页面**: `learn/index.html`

### 系统要求检查

1. **Node.js版本**：
```bash
node --version  # 应该是 18+ 
npm --version   # 应该是 9+
```

2. **端口检查**：
```bash
lsof -i :3000   # 检查端口3000是否被占用
netstat -an | grep 3000  # 另一种检查方式
```

3. **防火墙检查**：
```bash
# macOS 防火墙设置
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

### 备用启动方法

如果以上方法都不工作，可以使用我们的启动脚本：

```bash
cd /Users/chow/Desktop/LexiLoop
chmod +x start-dev.sh
./start-dev.sh
```

### 开发环境重置

完全清理并重新设置：

```bash
# 1. 清理所有Node进程
killall node

# 2. 清理依赖
cd /Users/chow/Desktop/LexiLoop/frontend
rm -rf node_modules .next package-lock.json

# 3. 重新安装
npm install

# 4. 重新构建
npm run build

# 5. 启动生产服务器
npm start
```

## 📝 已修复的问题

✅ **ESLint引号转义错误** - 已修复  
✅ **SSR window undefined错误** - 已修复  
✅ **Next.js配置冲突** - 已修复  
✅ **Tailwind CSS编译** - 已修复  
✅ **UI组件显示** - 已修复  

## 🎯 当前问题

🔄 **服务器连接问题** - 正在解决

### 临时解决方案

使用静态文件访问：
1. 打开 Finder
2. 导航到 `/Users/chow/Desktop/LexiLoop/frontend/out/`
3. 双击 `index.html`

这样可以立即查看所有页面和UI效果！