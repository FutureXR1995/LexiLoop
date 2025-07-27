#!/bin/bash

echo "🚀 启动 LexiLoop 静态服务器"
echo ""

# 确保在正确目录
if [ ! -d "out" ]; then
    echo "❌ 错误: 找不到 out 目录"
    echo "请先运行: npm run build"
    exit 1
fi

cd out

echo "📁 当前目录: $(pwd)"
echo "📊 静态文件统计:"
echo "   HTML 文件: $(find . -name "*.html" | wc -l)"
echo "   JS 文件: $(find . -name "*.js" | wc -l)"
echo "   CSS 文件: $(find . -name "*.css" | wc -l)"
echo ""

echo "🌐 尝试启动多个服务器..."
echo ""

# 方式1: Python HTTP服务器
if command -v python3 &> /dev/null; then
    echo "✅ Python HTTP 服务器 (端口 8080)"
    python3 -m http.server 8080 > /dev/null 2>&1 &
    PID1=$!
    echo "   PID: $PID1"
else
    echo "❌ Python3 未安装"
fi

# 方式2: PHP 服务器  
if command -v php &> /dev/null; then
    echo "✅ PHP 服务器 (端口 8081)"
    php -S localhost:8081 > /dev/null 2>&1 &
    PID2=$!
    echo "   PID: $PID2"
else
    echo "❌ PHP 未安装"
fi

# 方式3: Node.js serve
if command -v npx &> /dev/null; then
    echo "✅ Node.js serve (端口 8082)"
    npx serve -s . -p 8082 > /dev/null 2>&1 &
    PID3=$!
    echo "   PID: $PID3"
else
    echo "❌ Node.js/npx 未安装"
fi

echo ""
echo "🎯 立即可用的访问方式:"
echo ""

# 直接文件访问
CURRENT_PATH=$(pwd)
echo "📂 直接文件访问 (最可靠):"
echo "   file://$CURRENT_PATH/index.html"
echo ""

# 网络访问
echo "🌐 网络服务器访问:"
if [ ! -z "$PID1" ]; then
    echo "   http://localhost:8080 (Python)"
fi
if [ ! -z "$PID2" ]; then
    echo "   http://localhost:8081 (PHP)"
fi
if [ ! -z "$PID3" ]; then
    echo "   http://localhost:8082 (Node.js)"
fi

echo ""
echo "💡 推荐优先级:"
echo "   1. 直接打开 index.html 文件"
echo "   2. 尝试 http://localhost:8080"
echo "   3. 尝试 http://localhost:8081"
echo "   4. 尝试 http://localhost:8082"

echo ""
echo "🎨 完整页面列表:"
echo "   首页: index.html"
echo "   阅读: reading/index.html"
echo "   测试: azure-speech-test/index.html"
echo "   AI测试: claude-ai-test/index.html"
echo "   个人资料: profile/index.html"
echo "   学习计划: learning-plan/index.html"
echo "   词汇库: library/index.html"

echo ""
echo "📱 移动端支持: ✅ 完整响应式设计"
echo "🎯 离线支持: ✅ 无需网络连接"
echo "🔒 隐私保护: ✅ 本地运行，无数据上传"

echo ""
echo "⚠️  注意事项:"
echo "   - Azure Speech 和 Claude AI 功能需要网络服务器支持"
echo "   - 某些动态功能将显示模拟数据"
echo "   - 所有 UI 和界面功能完全正常"

echo ""
echo "🛑 按 Ctrl+C 停止所有服务器"
echo "📞 如有问题，请查看 STATIC_ACCESS.md 文档"

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务器..."; [ ! -z "$PID1" ] && kill $PID1 2>/dev/null; [ ! -z "$PID2" ] && kill $PID2 2>/dev/null; [ ! -z "$PID3" ] && kill $PID3 2>/dev/null; echo "✅ 所有服务器已停止"; exit 0' INT

# 保持脚本运行
wait