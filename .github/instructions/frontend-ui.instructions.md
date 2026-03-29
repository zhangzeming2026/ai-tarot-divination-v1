---
description: "Use when editing frontend UI structure, DOM rendering, interaction flow, animations, styles, or assets in src/main.js, src/styles.css, src/tarot.js, or index.html. Covers state-driven rendering, tarot layout semantics, and visual consistency."
name: "Frontend UI Guardrails"
applyTo:
  - "src/**/*.js"
  - "src/**/*.css"
  - "index.html"
---

# Frontend UI Guidelines

## Scope
- 仅用于前端界面相关改动：布局、样式、DOM 渲染、交互流程、文案与动效。
- 新增或修改 UI 时，优先保持现有“神秘星空 + 金色纹理”的视觉方向一致。

## Architecture and Rendering
- 前端入口与状态主控在 `src/main.js`，保持以 `state` 为单一事实来源并通过渲染函数更新界面。
- 塔罗数据与抽牌逻辑在 `src/tarot.js`，UI 层不要复制牌库常量或位置语义。
- 保持三张牌位置语义固定：过去的根源 / 当下的课题 / 未来的走向。
- 涉及抽牌或翻牌流程时，优先在现有事件与渲染链路上扩展，避免新增并行状态机。

## Interaction Conventions
- 保持主要交互入口稳定：问题输入、牌池范围选择、开始占卜按钮。
- 对异步流程（抽牌、请求解读）必须提供明确状态反馈，避免无响应感。
- 当接口失败或参数无效时，展示中文可读错误信息，且不阻塞后续重新尝试。

## Styling Conventions
- 样式集中维护在 `src/styles.css`，避免在 JS 中写内联样式（动态计算样式除外）。
- 新增样式优先复用现有命名与层级结构，避免大范围重命名导致回归。
- 需兼顾桌面与移动端；新增布局时至少验证窄屏下可读性与可点击性。
- 图片资源统一放在 `image/`，前端通过 `/image/...` 路径访问。

## Change Checklist
- 改动 UI 后至少手动验证：
  - 首页初始态可正常渲染（含默认三张卡牌展示）
  - 抽牌与翻牌动画顺序正常，且每张牌文案与位置对应正确
  - 成功解读、失败解读两条路径均有清晰反馈
  - 移动端宽度下无关键内容溢出或按钮不可点

## Reference
- 前端实现基线见 `src/main.js`、`src/tarot.js`、`src/styles.css`。
- 运行与部署约束见 `README.md` 与 `DEPLOY.md`。