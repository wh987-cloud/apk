#!/bin/bash

echo "========================================"
echo "React Native 比特币密钥生成器 - 构建脚本"
echo "========================================"
echo

echo "检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js环境"
    echo "请安装Node.js 16或更高版本"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js环境检查通过"
echo "Node.js版本: $(node --version)"
echo

echo "检查npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm"
    exit 1
fi

echo "✅ npm检查通过"
echo "npm版本: $(npm --version)"
echo

echo "检查React Native CLI..."
if ! npx react-native --version &> /dev/null; then
    echo "⚠️  警告: 未安装React Native CLI，正在安装..."
    npm install -g @react-native-community/cli
fi

echo "✅ React Native CLI检查通过"
echo

echo "开始构建过程..."
echo

echo "1. 安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo
echo "2. 清理Android构建..."
cd android
./gradlew clean
if [ $? -ne 0 ]; then
    echo "⚠️  警告: Android清理失败，继续构建..."
fi
cd ..

echo
echo "3. 构建Android调试版本..."
npm run build:android-debug
if [ $? -ne 0 ]; then
    echo "❌ Android调试版本构建失败"
    exit 1
fi

echo
echo "4. 构建Android发布版本..."
npm run build:android
if [ $? -ne 0 ]; then
    echo "❌ Android发布版本构建失败"
    exit 1
fi

echo
echo "========================================"
echo "构建完成！"
echo "========================================"
echo
echo "生成的APK文件位置:"
echo "调试版本: android/app/build/outputs/apk/debug/app-debug.apk"
echo "发布版本: android/app/build/outputs/apk/release/app-release.apk"
echo

if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "调试版本APK已生成，可以直接安装到设备上"
    echo "文件大小: $(ls -lh android/app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')"
fi

echo
echo "运行应用:"
echo "  npm run android  - 在Android设备上运行"
echo "  npm start        - 启动Metro服务器"
echo 