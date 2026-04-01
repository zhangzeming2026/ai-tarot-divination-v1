# AI Diviner EXE Package

## 使用方式

1. 配置 .env（可由 .env.example 复制后修改 OPENAI_API_KEY）。
2. 双击 start-exe.bat 或 ai-diviner.exe。
3. 程序会自动打开 http://localhost:8787。

## 注意

- 首次运行请确保已配置有效 OPENAI_API_KEY。
- 请保留整个 release/exe 目录一起运行，不要只单独复制 ai-diviner.exe。
- 如 8787 端口被占用，请在 .env 中修改 PORT。
- 关闭程序请结束 ai-diviner.exe 进程。
