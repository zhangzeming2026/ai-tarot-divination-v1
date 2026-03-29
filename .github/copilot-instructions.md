# Project Guidelines

## Code Style
- 使用 ESM 语法（项目为 `type: module`），新代码与现有文件保持一致。
- 前端采用原生 JavaScript + Vite，优先复用 `src/main.js` 的状态管理与 DOM 更新方式。
- 服务端采用 Express 路由风格，保持错误返回为明确中文信息，并使用 JSON 响应。

## Architecture
- 前端入口在 `src/main.js`，塔罗数据与抽牌逻辑在 `src/tarot.js`，样式在 `src/styles.css`。
- 后端入口在 `server/index.js`，提示词模板在 `server/prompt.js`。
- `server/index.js` 同时承载 API 与生产静态资源托管（存在 `dist/` 时提供页面）。
- 部署打包脚本为 `scripts/build-deploy-package.mjs`，产物目录为 `release/ai-diviner-deploy/`。

## Build and Test
- 安装依赖：`npm install`
- 本地开发（前后端并行）：`npm run dev`
- 构建前端：`npm run build`
- 生产运行：`npm run start`
- 生成部署包：`npm run package:deploy`
- 当前仓库未配置自动化测试。涉及业务逻辑改动时，至少手动验证：
  - `GET /api/health`
  - `POST /api/reading`（传入 3 张牌）

## Conventions
- `/api/reading` 入参必须包含 `question` 与长度为 3 的 `cards` 数组；不要修改该契约，除非同步更新前后端。
- 模型输出契约固定为 `overall`、`perCard`（长度 3）与 `advice`，见 `server/index.js` 校验逻辑。
- 图片资源放在 `image/`，前端通过 `/image/...` 访问；新增图片时保持这一约定。
- 三张牌位置语义固定为“过去的根源 / 当下的课题 / 未来的走向”。
- 部署与运维细节请链接阅读，不要在此重复：`README.md`、`DEPLOY.md`。

## Pitfalls
- 本项目依赖 Node.js 18+（服务端使用原生 `fetch`）。
- 开发环境前端通过 `vite.config.js` 的 `/api` 代理访问 `http://localhost:8787`。
- 生产环境需配置 `.env`（至少 `OPENAI_API_KEY`、`OPENAI_MODEL`、`OPENAI_BASE_URL`、`PORT`）。