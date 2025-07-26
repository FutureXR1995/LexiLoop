# Phase 0.5 启动指南

## 🚀 快速启动LexiLoop技术验证环境

### 前置条件
- Node.js 18+ 
- Python 3.9+
- PostgreSQL (可选，使用Docker)
- Redis (可选，使用Docker)

### 1. 环境配置

#### 创建环境变量文件
```bash
cp .env.example .env
```

#### 基础配置（无需API密钥即可测试）
```bash
# .env 文件内容
DATABASE_URL="postgresql://lexiloop:lexiloop_password@localhost:5432/lexiloop"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-for-development"
NODE_ENV="development"
PORT=8000
AI_SERVICE_PORT=8001
CORS_ORIGIN="http://localhost:3000"

# AI服务密钥（可选，用于真实AI测试）
# OPENAI_API_KEY="your_openai_api_key_here"
# AZURE_SPEECH_KEY="your_azure_speech_key_here"
# AZURE_SPEECH_REGION="eastus"
```

### 2. 数据库启动（使用Docker）

```bash
# 启动PostgreSQL和Redis
docker-compose up -d postgres redis

# 等待数据库启动
sleep 10

# 初始化数据库（如果需要）
docker exec -i lexiloop-postgres psql -U lexiloop -d lexiloop < database/schema.sql
docker exec -i lexiloop-postgres psql -U lexiloop -d lexiloop < database/seed_data.sql
```

### 3. 安装依赖

#### 后端依赖
```bash
cd backend
npm install
```

#### AI服务依赖
```bash
cd ../ai-service
pip install -r requirements.txt
```

#### 前端依赖
```bash
cd ../frontend
npm install
```

### 4. 启动服务

#### 方法1: 分别启动（推荐用于开发调试）

**终端1 - AI服务:**
```bash
cd ai-service
python3 main.py
```

**终端2 - 后端API:**
```bash
cd backend
npm run dev
```

**终端3 - 前端:**
```bash
cd frontend
npm run dev
```

#### 方法2: 统一启动（如果配置正确）
```bash
# 在项目根目录
npm run dev
```

### 5. 验证系统运行

#### AI服务测试
```bash
cd ai-service
python3 simple_test.py
```

#### 后端API测试
```bash
# 在项目根目录
node test_backend.js
```

#### 手动测试API端点
```bash
# 健康检查
curl http://localhost:8000/health

# 获取词汇列表
curl http://localhost:8000/api/vocabularies

# 生成故事（需要AI服务运行）
curl -X POST http://localhost:8000/api/stories/generate \
  -H "Content-Type: application/json" \
  -d '{"vocabulary": ["adventure", "mysterious"], "difficulty": 2}'
```

### 6. 访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **AI服务**: http://localhost:8001
- **API文档**: http://localhost:8001/docs (FastAPI自动生成)

### 7. Phase 0.5 核心功能验证清单

#### ✅ 基础架构验证
- [ ] 项目结构搭建完成
- [ ] 环境配置正确
- [ ] 服务间通信正常
- [ ] 数据库连接成功

#### ✅ AI服务验证
- [ ] 故事生成算法工作正常
- [ ] 内容质量验证通过
- [ ] 缓存机制运行正常
- [ ] API接口响应正确

#### ✅ 后端API验证
- [ ] RESTful API结构清晰
- [ ] 错误处理机制完善
- [ ] 日志记录功能正常
- [ ] 路由结构合理

#### ✅ 系统集成验证
- [ ] 前后端通信正常
- [ ] AI服务集成成功
- [ ] 数据流转顺畅
- [ ] 性能响应满足要求

### 8. 故障排除

#### AI服务无法启动
```bash
# 检查Python依赖
pip list | grep -E "(fastapi|openai|redis)"

# 检查端口占用
lsof -i :8001
```

#### 后端API报错
```bash
# 检查Node.js版本
node --version

# 检查依赖安装
cd backend && npm ls
```

#### 数据库连接失败
```bash
# 检查Docker容器状态
docker ps | grep postgres

# 测试数据库连接
docker exec -it lexiloop-postgres psql -U lexiloop -d lexiloop -c "SELECT 1;"
```

### 9. 下一步计划

Phase 0.5完成后，进入Week 3-6：
1. 实现完整的故事生成功能
2. 构建基础前端界面
3. 集成用户认证系统
4. 实现测试功能

### 10. 开发技巧

#### 实时日志查看
```bash
# 后端日志
cd backend && npm run dev

# AI服务日志
cd ai-service && python3 main.py

# Docker容器日志
docker logs -f lexiloop-postgres
docker logs -f lexiloop-redis
```

#### 快速重启
```bash
# 重启所有服务
docker-compose restart

# 清理缓存重启
docker-compose down && docker-compose up -d
```

---

**🎯 Phase 0.5目标**: 验证技术可行性，建立开发基础，为后续功能开发铺平道路。