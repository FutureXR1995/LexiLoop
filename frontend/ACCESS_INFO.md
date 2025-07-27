# LexiLoop 访问信息

## 🚀 开发服务器访问地址

**主要访问地址：** http://localhost:3002

### 📱 应用页面
- **首页**: http://localhost:3002
- **学习界面**: http://localhost:3002/learn
- **阅读界面**: http://localhost:3002/reading
- **词汇库**: http://localhost:3002/library
- **个人资料**: http://localhost:3002/profile
- **学习计划**: http://localhost:3002/learning-plan
- **错题复习**: http://localhost:3002/error-review

### 🧪 测试页面
- **Azure 语音测试**: http://localhost:3002/azure-speech-test
- **Claude AI 测试**: http://localhost:3002/claude-ai-test
- **语音调试**: http://localhost:3002/voice-debug

### 🔧 启动命令
```bash
npm run dev
```

### ⚙️ 配置信息
- **端口**: 3002 (配置在 .env.local 和 package.json)
- **Azure Speech Services**: ✅ 已配置
- **Claude AI**: ✅ 已配置
- **中间件**: 暂时简化（调试模式）

### 🐛 故障排除
如果无法访问：
1. 确认端口 3002 没有被其他进程占用
2. 检查 .env.local 文件是否存在
3. 重新运行 `npm run dev`
4. 检查控制台是否有错误信息

### 📊 功能状态
- ✅ 完整前端 UI
- ✅ Azure Speech Services TTS
- ✅ Claude AI 内容生成
- ✅ 响应式设计
- ✅ 所有核心功能