# AI Diviner

一个神秘风格的 AI 塔罗占卜网站：输入问题，抽取三张塔罗牌，完成翻牌动画后调用大模型生成占卜解读。

## 技术栈

- 前端：Vite + 原生 HTML/CSS/JavaScript
- 后端：Node.js + Express
- 模型：OpenAI 兼容 API（服务端调用，支持 OpenAI / 阿里百炼）

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

- 复制 `.env.example` 为 `.env`
- 填写 `OPENAI_API_KEY`

OpenAI 示例：

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
PORT=8787
VITE_ONLY_MAJOR_ARCANA=false
```

阿里百炼（DashScope 兼容模式）示例：

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=qwen-plus
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
PORT=8787
VITE_ONLY_MAJOR_ARCANA=false
```

`VITE_ONLY_MAJOR_ARCANA` 开关说明：

- `false`（默认）：使用完整 78 张牌（大阿卡那 + 小阿卡那）
- `true`：只使用 22 张大阿卡那

页面中的“牌池范围”下拉框可在占卜前切换：

- 完整 78 张（大阿卡那 + 小阿卡那）
- 仅 22 张大阿卡那

未手动切换时，会按照 `VITE_ONLY_MAJOR_ARCANA` 的值作为默认选项。

3. 启动开发环境

```bash
npm run dev
```

- 前端页面默认在 `http://localhost:5173`
- API 默认在 `http://localhost:8787`

## 构建

```bash
npm run build
```

生产构建后可直接用 Express 启动完整站点：

```bash
npm run start
```

- 页面和 API 会统一由 `http://localhost:8787` 提供

## 生成服务器部署包

```bash
npm run package:deploy
```

执行后会自动：

- 构建前端生产资源
- 生成 `release/ai-diviner-deploy/` 部署目录
- 生成 `release/ai-diviner-deploy.zip` 压缩包（Windows）

部署包内置一键部署脚本：

- Linux/macOS：`deploy/deploy.sh`
- Windows Server：`deploy/deploy.ps1`

部署脚本会先校验 Node.js 版本（需 18+），不满足时会直接提示并退出。

部署包还包含：

- Linux 开机自启服务模板：`deploy/systemd/ai-diviner.service`
- Linux 自动安装服务脚本：`deploy/install-systemd.sh`
- Nginx 反向代理模板：`deploy/nginx/ai-diviner.conf`

详细服务器部署说明见 `DEPLOY.md`。

## 关键功能

- 三张不重复抽牌（默认 78 张，可切换仅大阿卡那 22 张）
- 卡牌依次翻牌动画
- 深紫 + 金色纹理 + 星空背景
- 响应式布局（手机可用）
- AI 解读接口（前端不暴露密钥）

## 注意事项

- 未设置 `OPENAI_API_KEY` 时，后端会返回错误提示。
- 切换模型服务商时，保持 `OPENAI_API_KEY / OPENAI_MODEL / OPENAI_BASE_URL` 三项一致。
- 请确保 Node.js 版本支持 `fetch`（建议 Node 18+）。
