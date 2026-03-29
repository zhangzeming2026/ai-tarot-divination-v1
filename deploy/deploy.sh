#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/.app.pid"
LOG_DIR="$ROOT_DIR/logs"
LOG_FILE="$LOG_DIR/app.log"

cd "$ROOT_DIR"

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