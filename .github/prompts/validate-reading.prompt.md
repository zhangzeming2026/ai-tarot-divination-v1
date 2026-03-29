---
description: "Validate /api/health and /api/reading end-to-end with a fixed checklist, including success and invalid-parameter paths, and return a pass/fail report."
name: "Validate Reading API"
argument-hint: "可选：baseUrl（默认 http://localhost:8787）"
agent: "agent"
---

# Validate Reading API

按以下清单执行一次可复现的接口验证，并输出结构化结果报告。

## Goal
- 验证探活接口可用：`GET /api/health`
- 验证占卜接口成功路径：`POST /api/reading`（`question` + 3 张 `cards`）
- 验证占卜接口失败路径：`POST /api/reading`（非法参数）
- 确认响应结构与状态码符合项目约定

## Inputs
- 若用户提供 `baseUrl`，优先使用该地址。
- 未提供时使用默认：`http://localhost:8787`。

## Validation Steps
1. 读取契约基线与相关约束：
   - [server/index.js](../../server/index.js)
   - [.github/instructions/api-contract.instructions.md](../instructions/api-contract.instructions.md)
2. 调用 `GET /api/health`，记录：状态码、JSON 结构、关键字段。
3. 构造合法请求并调用 `POST /api/reading`：
   - `question` 为非空字符串。
   - `cards` 为长度 3 的数组；每项包含至少：`position`、`name`、`orientation`、`meaning`。
4. 校验成功响应：
   - 状态码为 `2xx`。
   - 响应结构为 `{ reading: { overall, perCard, advice } }`。
   - `reading.perCard` 为长度 3 的数组。
5. 构造非法请求并调用 `POST /api/reading`（示例：缺少 `question` 或 `cards` 长度不是 3）。
6. 校验失败响应：
   - 状态码为 `400`（参数错误）或契约约定的非 2xx。
   - 响应为 JSON，且包含 `error` 字段。

## Reporting Format
输出一个简洁报告，包含：

1. `Environment`
   - `baseUrl`
   - 是否检测到服务可访问
2. `Checklist`
   - `GET /api/health`: Pass/Fail + 关键证据
   - `POST /api/reading (valid)`: Pass/Fail + 关键证据
   - `POST /api/reading (invalid)`: Pass/Fail + 关键证据
3. `Contract Verification`
   - 是否满足 `overall/perCard/advice` 契约
   - 是否满足 `perCard.length === 3`
   - 错误响应是否包含 `error`
4. `Issues`
   - 若失败，给出最小修复建议（按严重程度排序）
5. `Next Actions`
   - 列出 1-3 个可执行下一步

## Notes
- 不要修改业务代码，除非用户明确要求“顺便修复”。
- 若服务未启动，先明确阻塞原因，并提供最短启动命令（例如 `npm run dev` 或 `npm run start`）。