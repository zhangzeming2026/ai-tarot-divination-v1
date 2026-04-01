# 🌟 AI 占卜 - 独立版本

## 快速开始

### 第一次运行
1. **配置密钥**
   - 用文本编辑器打开 `.env.example`
   - 填入 `OPENAI_API_KEY`（申请地址：https://platform.openai.com/api-keys）
   - 保存为 `.env`

2. **启动程序**
   - 双击 「启动.bat」
   - 如需静默启动，可双击 `start-exe.bat`
   - 程序会自动打开浏览器访问 http://localhost:8787

### 后续运行
- 直接双击「启动.bat」即可
- 请保留整个目录，不要只单独复制 `ai-diviner.exe`

## 环境变量说明

在 `.env` 文件中配置（可参考 `.env.example`）：

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `OPENAI_API_KEY` | **必填** - OpenAI API 密钥 | `sk-...` |
| `OPENAI_MODEL` | **可选** - 使用的模型 | `gpt-4.1-mini` |
| `OPENAI_BASE_URL` | **可选** - API 端点 | `https://api.openai.com/v1` |
| `PORT` | **可选** - 服务端口 | `8787` |
| `VITE_ONLY_MAJOR_ARCANA` | **可选** - 只用大阿卡那 (22张) | `false` |

## 常见问题

### 提示「未配置 OPENAI_API_KEY」
- 确保已创建 `.env` 文件
- 检查密钥是否正确粘贴（避免多余空格）

### 端口被占用
- 修改 `.env` 中的 `PORT` 为其他数字（如 `8788`）
- 重新启动程序

### 浏览器未自动打开
- 请手动访问 http://localhost:8787

### 提示前端资源缺失或无法启动
- 请确认 `dist/`、`image/`、`start-exe.vbs` 与 `ai-diviner.exe` 在同一目录中
- 不要只单独复制 exe 文件

## 阿里百炼/DashScope 配置示例

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=qwen-plus
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
PORT=8787
```

## 关闭程序
- 关闭浏览器后，程序会自动停止
- 或从任务管理器结束 `ai-diviner.exe` 进程
