#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/.app.pid"
LOG_DIR="$ROOT_DIR/logs"
LOG_FILE="$LOG_DIR/app.log"

cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js，请先安装 Node.js 18+ 后再部署。"
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "当前 Node.js 版本过低（$(node -v)），请升级到 18+ 后再部署。"
  exit 1
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "已自动创建 .env，请补充 OPENAI_API_KEY 后重新执行。"
  exit 1
fi

npm install --omit=dev
mkdir -p "$LOG_DIR"

if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE")"
  if kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID"
    sleep 1
  fi
fi

nohup npm run start >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "部署完成，应用已启动。"
echo "访问地址: http://服务器IP:8787"
echo "日志文件: $LOG_FILE"