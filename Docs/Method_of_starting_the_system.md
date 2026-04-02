安装依赖：npm install
配置 .env 中的 OpenAI 兼容接口环境变量（至少 `OPENAI_API_KEY`、`OPENAI_MODEL`、`OPENAI_BASE_URL`、`PORT`），详细说明见 `README.md` 与 `DEPLOY.md`
启动项目：npm run dev
开发环境访问：http://localhost:5173（生产环境请使用 `.env` 中 `PORT` 指定的端口，例如 `http://localhost:PORT`）
