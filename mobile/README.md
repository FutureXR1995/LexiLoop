# LexiLoop Mobile App 🧠📱

LexiLoop的React Native移动应用，提供完整的词汇学习体验。

## 📋 系统要求

### iOS 开发
- macOS 10.15 (Catalina) 或更高版本
- Xcode 12.0 或更高版本
- iOS 11.0 或更高版本
- CocoaPods

### Android 开发
- Android Studio
- Android SDK (API level 21 或更高)
- Java Development Kit (JDK) 11

### 通用要求
- Node.js 18+ 
- npm 或 yarn
- React Native CLI

## 🚀 快速开始

### 1. 安装依赖
```bash
cd /Users/chow/Desktop/LexiLoop/mobile
npm install
```

### 2. iOS 设置
```bash
# 安装 CocoaPods (如果尚未安装)
sudo gem install cocoapods

# 安装 iOS 依赖
cd ios
pod install
cd ..
```

### 3. Android 设置
```bash
# 确保 Android Studio 已安装并配置好 Android SDK
# 设置环境变量 (添加到 ~/.bash_profile 或 ~/.zshrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 📱 运行应用

### 在 iOS 模拟器上运行
```bash
npm run ios
# 或指定特定设备
npx react-native run-ios --simulator="iPhone 14"
```

### 在 Android 模拟器上运行
```bash
npm run android
```

### 在真实设备上运行

#### iOS 真机调试
1. 连接 iPhone 到 Mac
2. 在 Xcode 中打开 `ios/LexiLoop.xcworkspace`
3. 选择你的设备
4. 点击运行按钮

#### Android 真机调试
1. 启用 Android 设备的开发者选项和 USB 调试
2. 连接设备到电脑
3. 运行 `adb devices` 确认设备已连接
4. 运行 `npm run android`

## 🌐 Web端访问移动友好界面

如果您暂时无法运行原生应用，可以通过以下方式在手机浏览器中查看：

### 方法1: 直接访问Web版本
1. 确保前端服务器运行：
   ```bash
   cd /Users/chow/Desktop/LexiLoop/frontend
   npm run dev
   ```

2. 在手机浏览器中访问：`http://[您的电脑IP]:3001`

### 方法2: 使用移动端调试工具
```bash
# 安装 ngrok 用于外网访问
npm install -g ngrok

# 启动前端服务器
cd /Users/chow/Desktop/LexiLoop/frontend
npm run dev

# 在另一个终端中
ngrok http 3001
```

然后使用 ngrok 提供的 https URL 在任何设备上访问。

## 🛠️ 开发工具

### React Native Debugger
```bash
# 安装 React Native Debugger
brew install --cask react-native-debugger

# 启动调试器
npx react-native start --reset-cache
```

### Flipper (推荐)
1. 下载并安装 [Flipper](https://fbflipper.com/)
2. 运行应用
3. Flipper 将自动检测并连接到应用

## 📊 当前功能状态

### ✅ 已实现功能
- 🔐 用户认证系统
- 🎨 主题切换 (浅色/深色模式)
- 📱 响应式导航系统
- 🔄 离线数据缓存
- 📬 推送通知支持
- 🧠 高级测试界面
- 👥 社交功能基础

### 🚧 待完善功能
- AI故事生成集成
- 间隔重复算法界面
- 语音识别功能
- 离线学习模式
- 数据同步

## 🏗️ 项目结构

```
mobile/
├── src/
│   ├── components/          # 可复用组件
│   ├── screens/            # 应用屏幕
│   │   ├── auth/           # 认证相关屏幕
│   │   ├── main/           # 主要功能屏幕
│   │   ├── learning/       # 学习相关屏幕
│   │   └── social/         # 社交功能屏幕
│   ├── navigation/         # 导航配置
│   ├── services/          # API和服务
│   ├── store/             # 状态管理
│   ├── hooks/             # 自定义 Hooks
│   └── utils/             # 工具函数
├── android/               # Android 原生代码
├── ios/                  # iOS 原生代码
└── package.json          # 依赖配置
```

## 🔧 常见问题解决

### Metro bundler 缓存问题
```bash
npx react-native start --reset-cache
```

### iOS 编译错误
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Android 编译错误
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 端口冲突
```bash
# 清理 Metro 进程
npx react-native start --reset-cache --port=8082
```

## 📱 设备兼容性

### iOS
- iOS 11.0+
- iPhone 6s 及更新机型
- iPad (第6代) 及更新机型

### Android
- Android 5.0 (API level 21)+
- ARM64, ARMv7a 架构
- 最低 2GB RAM

## 🎯 性能优化

### 启用 Hermes (Android)
已在 `android/app/build.gradle` 中启用 Hermes JavaScript 引擎以提升性能。

### 图片优化
使用 `react-native-fast-image` 进行图片缓存和优化。

### 代码分割
使用动态导入减少初始包大小。

## 📞 支持与反馈

如果在移动端开发过程中遇到问题：

1. 检查 React Native 环境配置
2. 查看控制台错误日志
3. 参考 React Native 官方文档
4. 提交 Issue 到项目仓库

---

**注意**: 移动应用目前处于开发阶段，部分功能可能需要后端API支持才能完全正常工作。建议先确保后端服务正常运行。