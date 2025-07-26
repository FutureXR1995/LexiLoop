# LexiLoop 🚀

> AI-powered vocabulary learning platform with spaced repetition, social features, and comprehensive testing modes

[![GitHub stars](https://img.shields.io/github/stars/FutureXR1995/LexiLoop?style=social)](https://github.com/FutureXR1995/LexiLoop/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/FutureXR1995/LexiLoop?style=social)](https://github.com/FutureXR1995/LexiLoop/network/members)
[![GitHub issues](https://img.shields.io/github/issues/FutureXR1995/LexiLoop)](https://github.com/FutureXR1995/LexiLoop/issues)

## 🌟 Features

### Core Learning Experience
- **智能间隔重复算法** - SuperMemo2 algorithm for optimal retention
- **多模式学习** - Flashcard, typing, listening, and speaking modes
- **AI驱动内容生成** - Intelligent story and context generation
- **个性化学习路径** - Adaptive difficulty and content recommendation

### Social & Gamification
- **社交功能** - Friend system, leaderboards, and progress sharing
- **成就系统** - Comprehensive achievement tracking and rewards
- **竞技模式** - Real-time multiplayer vocabulary battles
- **学习统计** - Detailed analytics and progress visualization

### Technical Excellence
- **Real-time Performance** - Advanced caching and optimization
- **Cross-platform** - Web, mobile (React Native), and PWA support
- **Scalable Architecture** - Microservices with MongoDB and Redis
- **Admin Dashboard** - Content moderation and user management

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management

### Backend
- **Node.js + Express** - RESTful API server
- **MongoDB + Mongoose** - Document database with ODM
- **Redis** - Caching and session management
- **JWT** - Authentication and authorization

### Mobile
- **React Native** - Cross-platform mobile development
- **Expo** - Development and deployment platform

### AI Services
- **Python + FastAPI** - AI microservices
- **OpenAI API** - Content generation and validation
- **Speech Recognition** - Voice interaction capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional, for caching)
- Python 3.8+ (for AI services)

### Installation

```bash
# Clone the repository
git clone https://github.com/FutureXR1995/LexiLoop.git
cd LexiLoop

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### Individual Services

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Available at http://localhost:3001
```

#### Backend (Node.js)
```bash
cd backend
npm install
npm run dev
# Available at http://localhost:8000
```

#### Mobile (React Native)
```bash
cd mobile
npm install
npm run android  # or npm run ios
```

#### AI Services (Python)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# Available at http://localhost:8001
```

## 📱 Features Overview

### Learning Modes

| Mode | Description | Status |
|------|-------------|--------|
| 📚 Flashcard | Traditional card-based learning | ✅ Complete |
| ⌨️ Typing | Type-to-learn with spell check | ✅ Complete |
| 🎧 Listening | Audio-based comprehension | ✅ Complete |
| 🗣️ Speaking | Voice recognition practice | 🚧 In Progress |

### Advanced Features

- **Spaced Repetition** - Scientific learning intervals
- **Progress Analytics** - Detailed learning statistics
- **Social Learning** - Friends, leaderboards, sharing
- **Content Library** - TOEFL, GRE, Business English collections
- **Admin Panel** - Content moderation and user management
- **Mobile App** - Full-featured React Native application

## 🗂️ Project Structure

```
LexiLoop/
├── frontend/           # Next.js web application
├── backend/           # Node.js API server
├── mobile/            # React Native mobile app
├── ai-service/        # Python AI microservices
├── database/          # Database schemas and migrations
├── docs/              # Documentation and guides
└── scripts/           # Utility scripts
```

## 📊 Current Status

### ✅ Completed Features
- [x] MVP with core learning functionality
- [x] Real-time vocabulary testing
- [x] User progress tracking
- [x] Social features (friends, leaderboards)
- [x] Admin panel and content moderation
- [x] Mobile app foundation
- [x] Performance optimizations
- [x] **Real MongoDB database integration**

### 🚧 In Progress
- [ ] Complete user authentication system
- [ ] Voice functionality (TTS and speech recognition)
- [ ] HTTPS deployment and SSL configuration

### 📋 Planned Features
- [ ] Mobile app optimization
- [ ] i18n internationalization framework
- [ ] Advanced analytics dashboard
- [ ] Offline mode support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📧 Email: support@lexiloop.com
- 🐛 Issues: [GitHub Issues](https://github.com/FutureXR1995/LexiLoop/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/FutureXR1995/LexiLoop/discussions)

## 🌟 Acknowledgments

- Built with ❤️ using modern web technologies
- AI-powered features for enhanced learning
- Community-driven development approach

---

**🚀 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**