# LexiLoop 故障排除指南

## 🚨 无法访问开发服务器问题

### 问题描述
开发服务器启动成功，但无法通过浏览器或curl访问 `localhost` 地址。

### 可能原因
1. **系统防火墙阻止**
2. **代理设置干扰**
3. **localhost 解析问题**
4. **权限问题**
5. **端口冲突**

### 解决方案

#### 方案 1: 使用生产构建模式
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

#### 方案 2: 检查系统配置
```bash
# 检查 localhost 解析
ping localhost

# 检查端口占用
lsof -i :3000
netstat -an | grep 3000

# 检查防火墙状态 (macOS)
sudo pfctl -s all
```

#### 方案 3: 尝试不同端口和地址
```bash
# 尝试其他端口
npx next dev --port 8080
npx next dev --port 5000

# 尝试具体IP地址
npx next dev --hostname 127.0.0.1
```

#### 方案 4: 检查代理设置
```bash
# 检查环境变量
echo $HTTP_PROXY
echo $HTTPS_PROXY
echo $NO_PROXY

# 临时禁用代理
unset HTTP_PROXY
unset HTTPS_PROXY
```

#### 方案 5: 重置网络配置 (macOS)
```bash
# 清除DNS缓存
sudo dscacheutil -flushcache

# 重置网络配置
sudo ifconfig lo0 down
sudo ifconfig lo0 up
```

### 📦 静态文件部署选项

如果开发服务器问题无法解决，可以使用静态导出：

```bash
# 1. 配置静态导出 (在 next.config.js 中)
# output: 'export'

# 2. 构建静态文件
npm run build

# 3. 使用任何Web服务器提供服务
npx serve out
# 或
python3 -m http.server 8000 --directory out
```

### 🏥 健康检查
```bash
# 检查Node.js版本
node --version

# 检查npm版本  
npm --version

# 检查项目依赖
npm list --depth=0

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 🔧 快速修复脚本

创建 `quick-start.sh`：
```bash
#!/bin/bash
echo "🔧 LexiLoop Quick Start"
echo "Stopping any running servers..."
pkill -f "next dev"

echo "Starting on different ports..."
echo "Trying port 3000..."
npx next dev --port 3000 --hostname 0.0.0.0 &
sleep 3

echo "Trying port 8080..."
npx next dev --port 8080 --hostname 0.0.0.0 &
sleep 3

echo "Check these addresses:"
echo "  http://localhost:3000"
echo "  http://localhost:8080"
echo "  http://127.0.0.1:3000"
echo "  http://127.0.0.1:8080"
```

### 📱 移动端访问

如果是在移动设备上测试，需要使用局域网IP：
```bash
# 获取本机IP地址
ifconfig | grep "inet " | grep -v 127.0.0.1

# 使用IP地址访问
# 例如: http://192.168.1.100:3000
```

### 🆘 最后手段

如果所有方法都失败，可以使用Docker运行：
```bash
# 构建Docker镜像
docker build -t lexiloop-frontend .

# 运行容器
docker run -p 3000:3000 lexiloop-frontend
```

### 📞 联系信息

如果问题持续存在：
1. 检查系统日志
2. 尝试重启终端/IDE
3. 重启系统网络服务
4. 检查是否有VPN或安全软件干扰