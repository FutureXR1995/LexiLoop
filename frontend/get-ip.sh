#!/bin/bash

echo "🔍 正在检测本机网络地址..."
echo ""

# 获取本机IP地址 (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📍 macOS 网络地址:"
    echo "   WiFi (en0): $(ipconfig getifaddr en0 2>/dev/null || echo '未连接')"
    echo "   以太网 (en1): $(ipconfig getifaddr en1 2>/dev/null || echo '未连接')"
    echo ""
    
    # 显示所有网络接口
    echo "🌐 所有可用地址:"
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "   " $2}'
    
# Linux
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📍 Linux 网络地址:"
    hostname -I | awk '{print "   " $1}'
    
# Windows (Git Bash)
else
    echo "📍 Windows 网络地址:"
    ipconfig | grep "IPv4" | head -1 | awk '{print $NF}'
fi

echo ""
echo "🚀 启动命令:"
echo "   npm run dev"
echo ""
echo "🌍 推荐访问地址:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ipconfig getifaddr en0 2>/dev/null)
    if [ ! -z "$IP" ]; then
        echo "   http://$IP:3000"
        echo "   http://$IP:3000/azure-speech-test"
        echo "   http://$IP:3000/claude-ai-test"
    else
        echo "   http://127.0.0.1:3000 (如果网络正常)"
    fi
else
    echo "   http://127.0.0.1:3000"
fi

echo ""
echo "⚡ 快速测试:"
echo "   curl http://127.0.0.1:3000"
echo ""