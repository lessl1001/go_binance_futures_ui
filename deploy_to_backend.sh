#!/bin/bash

# 前后端集成部署脚本
# 使用方法: ./deploy_to_backend.sh [后端项目路径]

set -e

# 默认后端项目路径
BACKEND_PATH="../go_binance_futures"

# 如果提供了参数，使用提供的路径
if [ "$1" != "" ]; then
    BACKEND_PATH="$1"
fi

echo "🚀 开始前后端集成部署..."
echo "后端项目路径: $BACKEND_PATH"

# 1. 检查后端项目是否存在
if [ ! -d "$BACKEND_PATH" ]; then
    echo "❌ 错误: 后端项目路径不存在: $BACKEND_PATH"
    echo "请确保后端项目路径正确，或使用以下方式指定路径："
    echo "  ./deploy_to_backend.sh /path/to/go_binance_futures"
    exit 1
fi

# 2. 构建前端项目
echo "🔨 构建前端项目..."
npm run build

# 3. 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 错误: 构建失败，dist目录不存在"
    exit 1
fi

# 4. 备份现有静态文件
if [ -d "$BACKEND_PATH/static" ]; then
    echo "📦 备份现有静态文件..."
    mv "$BACKEND_PATH/static" "$BACKEND_PATH/static.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 5. 创建静态文件目录
mkdir -p "$BACKEND_PATH/static"

# 6. 复制新的静态文件
echo "📁 复制静态文件到后端项目..."
cp -r dist/* "$BACKEND_PATH/static/"

# 7. 验证复制结果
if [ -f "$BACKEND_PATH/static/index.html" ]; then
    echo "✅ 集成完成！"
    echo "✅ 静态文件已成功复制到: $BACKEND_PATH/static/"
    echo ""
    echo "📋 后续步骤:"
    echo "1. 确保后端已配置静态文件服务"
    echo "2. 启动后端服务"
    echo "3. 访问后端地址验证前端页面"
    echo ""
    echo "🔍 故障排除:"
    echo "- 如果出现404错误，检查API路由配置"
    echo "- 如果页面刷新404，确保配置了SPA路由回退"
    echo "- 参考 FRONTEND_BACKEND_INTEGRATION_GUIDE.md"
else
    echo "❌ 错误: 文件复制失败"
    exit 1
fi