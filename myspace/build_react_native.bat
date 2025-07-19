@echo off
setlocal enabledelayedexpansion
echo ========================================
echo React Native 比特币密钥生成器 - 构建脚本
echo ========================================
echo.

echo 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js环境
    echo 请安装Node.js 16或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js环境检查通过
echo.

echo 检查npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到npm
    pause
    exit /b 1
)

echo ✅ npm检查通过
echo.

echo 检查React Native CLI...
npx react-native --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  警告: 未安装React Native CLI，正在安装...
    npm install -g @react-native-community/cli
)

echo ✅ React Native CLI检查通过
echo.

echo 开始构建过程...
echo.

echo 1. 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 2. 清理Android构建...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo ⚠️  警告: Android清理失败，继续构建...
)
cd ..

echo.
echo 3. 构建Android调试版本...
call npm run build:android-debug
if %errorlevel% neq 0 (
    echo ❌ Android调试版本构建失败
    pause
    exit /b 1
)

echo.
echo 4. 构建Android发布版本...
call npm run build:android
if %errorlevel% neq 0 (
    echo ❌ Android发布版本构建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 构建完成！
echo ========================================
echo.
echo 生成的APK文件位置:
echo 调试版本: android\app\build\outputs\apk\debug\app-debug.apk
echo 发布版本: android\app\build\outputs\apk\release\app-release.apk
echo.

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo 调试版本APK已生成，可以直接安装到设备上
    echo 文件大小: 
    dir "android\app\build\outputs\apk\debug\app-debug.apk" | find "app-debug.apk"
)

echo.
echo 运行应用:
echo   npm run android  - 在Android设备上运行
echo   npm start        - 启动Metro服务器
echo.
pause 