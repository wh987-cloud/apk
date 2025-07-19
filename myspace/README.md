# 比特币密钥生成器

这是一个使用React Native开发的跨平台移动应用程序，用于随机生成比特币私钥并转换为非压缩公钥，然后验证这些公钥是否在指定的目标公钥列表中。支持Android和iOS平台。

## 功能特性

- 🔐 **随机私钥生成** - 使用安全的加密算法生成随机比特币私钥
- 🔑 **公钥转换** - 将私钥转换为非压缩格式的公钥
- 📁 **文件验证** - 从pubkeys.txt文件加载目标公钥列表进行验证
- ⚡ **实时统计** - 显示生成速度、总数、找到的密钥数量
- 🎮 **手动控制** - 开始/停止生成过程
- 💾 **文件保存** - 将找到的密钥对保存到设备文件
- 📱 **跨平台** - 支持Android和iOS平台
- 🎨 **现代化UI** - 美观的用户界面设计

## 技术栈

- **框架**: React Native
- **语言**: JavaScript/TypeScript
- **平台**: Android & iOS
- **最低支持**: Android 5.0 (API 21) / iOS 12.0
- **Node.js版本**: 16+
- **主要依赖**:
  - React Native Crypto (加密库)
  - React Native FS (文件系统)
  - React Native Document Picker (文件选择)
  - React Navigation (导航)
  - React Native Vector Icons (图标)

## 项目结构

```
myspace/
├── src/                    # React Native源代码
│   ├── screens/           # 屏幕组件
│   │   └── MainScreen.js  # 主屏幕组件
│   ├── utils/             # 工具类
│   │   └── BitcoinKeyGenerator.js # 密钥生成器核心逻辑
│   └── App.js             # 主应用组件
├── android/               # Android原生代码
│   ├── app/
│   │   └── build.gradle   # Android应用配置
│   ├── build.gradle       # Android项目配置
│   ├── settings.gradle    # Android项目设置
│   └── gradle.properties  # Gradle属性
├── ios/                   # iOS原生代码
├── package.json           # 项目依赖配置
├── index.js               # 应用入口
├── metro.config.js        # Metro配置
├── babel.config.js        # Babel配置
├── pubkeys.txt            # 示例目标公钥文件
├── build_react_native.bat # Windows构建脚本
├── build_react_native.sh  # Linux/Mac构建脚本
└── README.md              # 项目说明
```

## 环境要求

### 环境要求

- Node.js 16+
- npm 或 yarn
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发，仅macOS)
- Android SDK API 21+

## 快速开始

### 构建步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd myspace
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建Android APK**
   ```bash
   # Windows
   build_react_native.bat
   
   # Linux/macOS
   ./build_react_native.sh
   ```

4. **运行开发版本**
   ```bash
   npm run android  # Android
   npm run ios      # iOS (仅macOS)
   ```

### 打包流程

1. **安装依赖**
   ```bash
   npm install
   ```

2. **清理构建**
   ```bash
   npm run clean
   ```

3. **构建发布版本**
   ```bash
   npm run build:android
   ```

4. **运行测试** (可选)
   ```bash
   npm test
   ```

生成的APK文件位于：`android/app/build/outputs/apk/release/app-release.apk`

## 使用方法

### 1. 准备公钥文件
创建一个文本文件（如pubkeys.txt），每行包含一个目标公钥：
```
04a0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47e247c7
04b0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47e247c8
```

### 2. 运行应用
1. 启动应用
2. 点击"选择公钥文件"按钮
3. 选择包含目标公钥的文本文件
4. 点击"开始生成"按钮
5. 应用将开始生成随机密钥对并验证

### 3. 监控进度
- 查看实时统计信息（生成速度、总数、找到数量）
- 找到匹配的公钥时会显示通知
- 可以随时点击"停止生成"按钮

### 4. 保存结果
- 找到密钥后，点击"保存到文件"按钮
- 文件将保存到设备的下载目录

## 安全注意事项

⚠️ **重要提醒**：

- 此应用仅用于教育和研究目的
- 生成的私钥可能对应真实的比特币地址
- 请勿在生产环境中使用随机生成的私钥
- 建议在隔离的测试环境中运行
- 请遵守当地法律法规

## 技术实现

### 密钥生成算法
- 使用椭圆曲线secp256k1
- 生成32字节随机私钥
- 转换为非压缩格式公钥（04 + x + y）

### 性能优化
- 异步生成避免阻塞UI
- 批量更新减少重渲染
- 内存管理优化

### 文件处理
- 支持多种文件格式
- 错误处理和验证
- 安全的文件读写

## 开发指南

### 环境设置
1. 安装Node.js 16+
2. 安装React Native CLI
3. 配置Android开发环境
4. 配置iOS开发环境（可选）

### 开发命令
```bash
# 启动Metro服务器
npm start

# 运行Android应用
npm run android

# 运行iOS应用
npm run ios

# 运行测试
npm test

# 代码检查
npm run lint
```

### 调试
- 使用React Native Debugger
- Chrome DevTools
- Flipper调试工具

## 故障排除

### 常见问题

1. **构建失败**
   - 检查Node.js版本
   - 清理构建缓存
   - 重新安装依赖

2. **文件权限错误**
   - 确保有读写权限
   - 检查文件路径

3. **性能问题**
   - 减少生成频率
   - 优化UI更新

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

本项目仅供学习和研究使用。

## 联系方式

如有问题或建议，请提交GitHub Issue。

---

**免责声明**: 本软件仅供教育和研究目的使用。使用者应自行承担使用风险，并遵守相关法律法规。 