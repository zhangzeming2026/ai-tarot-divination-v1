#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="ai-diviner"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
NGINX_CONFIG="/etc/nginx/conf.d/${SERVICE_NAME}.conf"

echo "=========================================="
echo "AI Diviner 卸载程序"
echo "=========================================="

if [ "$EUID" -ne 0 ]; then
  echo "此脚本必须以 sudo 权限执行"
  exit 1
fi

read -p "是否完全删除应用？这将删除应用目录。(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "取消卸载"
  exit 0
fi

echo ""
echo "[1/5] 停止 systemd 服务..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
  systemctl stop "$SERVICE_NAME"
  echo "✓ 服务已停止"
else
  echo "○ 服务未运行"
fi

echo ""
echo "[2/5] 禁用 systemd 启动..."
if systemctl is-enabled "$SERVICE_NAME" >/dev/null 2>&1; then
  systemctl disable "$SERVICE_NAME"
  echo "✓ 启动已禁用"
else
  echo "○ 服务未启用"
fi

echo ""
echo "[3/5] 删除 systemd 服务文件..."
if [ -f "$SERVICE_FILE" ]; then
  rm -f "$SERVICE_FILE"
  echo "✓ 服务文件已删除: $SERVICE_FILE"
else
  echo "○ 服务文件不存在"
fi

echo ""
echo "[4/5] 重载 systemd 配置..."
systemctl daemon-reload
echo "✓ systemd 配置已重载"

echo ""
echo "[5/5] 删除 Nginx 配置（如果存在）..."
if [ -f "$NGINX_CONFIG" ]; then
  read -p "是否删除 Nginx 配置？($NGINX_CONFIG) (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f "$NGINX_CONFIG"
    echo "✓ Nginx 配置已删除"
    
    echo "重新加载 Nginx..."
    if command -v nginx >/dev/null && systemctl is-active --quiet nginx; then
      nginx -t && systemctl reload nginx
      echo "✓ Nginx 已重载"
    else
      echo "○ Nginx 未安装或未运行，请手动重载"
    fi
  else
    echo "○ 跳过删除 Nginx 配置"
  fi
else
  echo "○ Nginx 配置不存在"
fi

echo ""
echo "=========================================="
echo "卸载完成！"
echo "应用目录可手动删除："
echo ""
echo "  sudo rm -rf /your/deployment/path"
echo ""
echo "=========================================="
