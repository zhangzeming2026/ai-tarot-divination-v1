#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "用法: sudo ./deploy/install-systemd.sh /实际部署目录 [运行用户]"
  exit 1
fi

APP_DIR="$1"
APP_USER="${2:-$SUDO_USER}"
SERVICE_NAME="ai-diviner"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
TEMPLATE_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/systemd/${SERVICE_NAME}.service"

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "未找到 systemd 模板: $TEMPLATE_FILE"
  exit 1
fi

if [ -z "${APP_USER:-}" ]; then
  APP_USER="root"
fi

ESCAPED_APP_DIR="${APP_DIR//\//\\/}"
ESCAPED_APP_USER="${APP_USER//\//\\/}"

sed \
  -e "s|__APP_DIR__|$ESCAPED_APP_DIR|g" \
  -e "s|__APP_USER__|$ESCAPED_APP_USER|g" \
  "$TEMPLATE_FILE" | sudo tee "$SERVICE_FILE" > /dev/null

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

echo "systemd 服务已安装并启动: $SERVICE_NAME"
echo "查看状态: sudo systemctl status $SERVICE_NAME"
echo "查看日志: sudo journalctl -u $SERVICE_NAME -f"