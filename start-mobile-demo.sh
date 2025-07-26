#!/bin/bash

# LexiLoop 移动端演示启动脚本
# 用于快速启动和查看移动端功能

echo "🚀 LexiLoop 移动端演示启动中..."
echo "================================"

# 获取本机IP地址
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "无法获取IP")

echo "📱 启动选项:"
echo "1. Web移动版 (推荐 - 最快最简单)"
echo "2. React Native 模拟器 (需要开发环境)"
echo "3. 仅显示访问信息"
echo ""

read -p "请选择 (1/2/3): " choice

case $choice in
    1)
        echo "🌐 启动Web移动版..."
        echo "请在手机浏览器中访问: http://$IP:3001"
        echo ""
        echo "📝 操作步骤:"
        echo "1. 确保手机和电脑在同一WiFi"
        echo "2. 在手机浏览器打开上述地址"
        echo "3. 页面会自动适配移动端"
        echo ""
        
        cd frontend
        echo "🎯 正在启动前端服务器..."
        npm run dev
        ;;
    2)
        echo "📲 启动React Native应用..."
        
        # 检查是否在移动端目录
        if [ ! -d "mobile" ]; then
            echo "❌ 错误: mobile目录不存在"
            exit 1
        fi
        
        cd mobile
        
        # 检查依赖是否已安装
        if [ ! -d "node_modules" ]; then
            echo "📦 正在安装依赖..."
            npm install
        fi
        
        echo "🔧 启动Metro bundler..."
        echo "请在另一个终端运行以下命令之一:"
        echo "  - iOS: npm run ios"
        echo "  - Android: npm run android"
        echo ""
        
        npm start
        ;;
    3)
        echo "📋 LexiLoop 移动端访问信息"
        echo "========================="
        echo ""
        echo "🌐 Web移动版 (手机浏览器):"
        echo "   http://$IP:3001"
        echo ""
        echo "📲 React Native 启动命令:"
        echo "   cd mobile && npm install && npm start"
        echo "   然后运行: npm run ios 或 npm run android"
        echo ""
        echo "🔧 开发者工具:"
        echo "   Chrome DevTools: 模拟器中按 Cmd+D"
        echo "   日志查看: npx react-native log-ios/android"
        echo ""
        echo "📱 功能亮点:"
        echo "   ✅ 个性化学习引擎"
        echo "   ✅ 社交和游戏化系统"  
        echo "   ✅ 高级测试模式"
        echo "   ✅ 间隔重复算法"
        echo "   ✅ 现代化UI设计"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac