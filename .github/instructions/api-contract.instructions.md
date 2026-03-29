---
description: "Use when editing Express API routes, request/response schemas, model output parsing, or validation logic in server code. Covers /api/reading and /api/health contract stability and error response conventions."
name: "API Contract Guardrails"
applyTo: "server/**/*.js"
---

# API Contract Guidelines

## Scope
- 仅用于服务端 API 契约相关改动（请求参数、响应结构、状态码、校验逻辑）。
- 优先保持现有前后端契约稳定；若必须变更契约，应同步更新前端调用与文档。

## Hard Requirements
- 保持 `/api/reading` 入参契约：`question` 必填，`cards` 必须为长度 3 的数组。
- 保持 `/api/reading` 成功响应结构：`{ reading: { overall, perCard, advice } }`。
- `reading.perCard` 必须保持长度 3，且与三张牌位置一一对应。
- 模型返回异常（空响应、非 JSON、字段缺失）时，必须返回明确错误信息与非 2xx 状态码。
- 保持 `/api/health` 可用且返回 JSON，避免引入会破坏探活的重逻辑。

## Error Response Conventions
- 错误响应统一为 JSON，并包含 `error` 字段（中文可读信息）。
- 请求参数错误使用 `400`；上游模型调用失败或格式异常使用 `502`；服务端未捕获异常使用 `500`。
- 不要将敏感信息（密钥、完整上游凭据）写入返回内容。

## Change Checklist
- 改动路由/校验后，至少手动验证：
  - `GET /api/health`
  - `POST /api/reading`（合法 3 张牌）
  - `POST /api/reading`（非法参数）
- 若涉及契约字段命名调整，必须同步检查前端渲染逻辑与 README 中的接口说明。

## Reference
- 现有契约实现基线见 `server/index.js`。
- 运行与部署约束见 `README.md` 与 `DEPLOY.md`。