import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const releaseRoot = path.join(projectRoot, "release");
const exeDir = path.join(releaseRoot, "exe");
const distributionRoot = path.join(releaseRoot, "distribution");
const packageName = "ai-diviner-win-standalone";
const outDir = path.join(distributionRoot, packageName);
const zipPath = path.join(distributionRoot, `${packageName}.zip`);

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function safeRemove(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function copyFile(from, to) {
  const dir = path.dirname(to);
  ensureDir(dir);
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    return;
  }

  ensureDir(to);
  fs.cpSync(from, to, { recursive: true, force: true });
}

function writeText(filePath, content) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content, "utf8");
}

console.log("[1/5] Rebuild exe runtime...");
execSync("npm.cmd run build:exe", {
  cwd: projectRoot,
  stdio: "inherit",
  windowsHide: true
});

console.log("[2/5] Prepare distribution directory...");
safeRemove(outDir);
safeRemove(zipPath);
ensureDir(outDir);

console.log("[3/5] Copy all runtime files...");
copyFile(path.join(exeDir, "ai-diviner.exe"), path.join(outDir, "ai-diviner.exe"));
copyFile(path.join(exeDir, ".env.example"), path.join(outDir, ".env.example"));
copyFile(path.join(exeDir, "start-exe.bat"), path.join(outDir, "start-exe.bat"));
copyFile(path.join(exeDir, "start-exe.vbs"), path.join(outDir, "start-exe.vbs"));
copyDir(path.join(exeDir, "dist"), path.join(outDir, "dist"));
copyDir(path.join(exeDir, "image"), path.join(outDir, "image"));

const launchBat = [
  "@echo off",
  "chcp 65001 >nul",
  "cd /d %~dp0",
  "if not exist .env if exist .env.example copy /Y .env.example .env >nul",
  "echo.",
  "echo 正在启动 AI 占卜程序...",
  "echo.",
  "start \"\" wscript.exe \"%~dp0start-exe.vbs\"",
  "timeout /t 2 /nobreak"
].join("\r\n");

writeText(path.join(outDir, "启动.bat"), `${launchBat}\r\n`);

const readme = [
  "# 🌟 AI 占卜 - 独立版本",
  "",
  "## 快速开始",
  "",
  "### 第一次运行",
  "1. **配置密钥**",
  "   - 用文本编辑器打开 `.env.example`",
  "   - 填入 `OPENAI_API_KEY`（申请地址：https://platform.openai.com/api-keys）",
  "   - 保存为 `.env`",
  "",
  "2. **启动程序**",
  "   - 双击 「启动.bat」",
  "   - 如需静默启动，可双击 `start-exe.bat`",
  "   - 程序会自动打开浏览器访问 http://localhost:8787",
  "",
  "### 后续运行",
  "- 直接双击「启动.bat」即可",
  "- 请保留整个目录，不要只单独复制 `ai-diviner.exe`",
  "",
  "## 环境变量说明",
  "",
  "在 `.env` 文件中配置（可参考 `.env.example`）：",
  "",
  "| 变量 | 说明 | 示例 |",
  "| --- | --- | --- |",
  "| `OPENAI_API_KEY` | **必填** - OpenAI API 密钥 | `sk-...` |",
  "| `OPENAI_MODEL` | **可选** - 使用的模型 | `gpt-4.1-mini` |",
  "| `OPENAI_BASE_URL` | **可选** - API 端点 | `https://api.openai.com/v1` |",
  "| `PORT` | **可选** - 服务端口 | `8787` |",
  "| `VITE_ONLY_MAJOR_ARCANA` | **可选** - 只用大阿卡那 (22张) | `false` |",
  "",
  "## 常见问题",
  "",
  "### 提示「未配置 OPENAI_API_KEY」",
  "- 确保已创建 `.env` 文件",
  "- 检查密钥是否正确粘贴（避免多余空格）",
  "",
  "### 端口被占用",
  "- 修改 `.env` 中的 `PORT` 为其他数字（如 `8788`）",
  "- 重新启动程序",
  "",
  "### 浏览器未自动打开",
  "- 请手动访问 http://localhost:8787",
  "",
  "### 提示前端资源缺失或无法启动",
  "- 请确认 `dist/`、`image/`、`start-exe.vbs` 与 `ai-diviner.exe` 在同一目录中",
  "- 不要只单独复制 exe 文件",
  "",
  "## 阿里百炼/DashScope 配置示例",
  "",
  "```env",
  "OPENAI_API_KEY=sk-...",
  "OPENAI_MODEL=qwen-plus",
  "OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1",
  "PORT=8787",
  "```",
  "",
  "## 关闭程序",
  "- 关闭浏览器后，程序会自动停止",
  "- 或从任务管理器结束 `ai-diviner.exe` 进程"
].join("\n");

writeText(path.join(outDir, "README.md"), `${readme}\n`);

const quickStart = [
  "AI 占卜 · 快速开始",
  "====================",
  "",
  "1️⃣  编辑 .env.example 文件",
  "    - 填入 OPENAI_API_KEY",
  "    - 保存为 .env",
  "",
  "2️⃣  双击「启动.bat」运行程序",
  "",
  "3️⃣  浏览器会自动打开占卜页面",
  "",
  "更多说明详见 README.md"
].join("\n");

writeText(path.join(outDir, "快速开始.txt"), `${quickStart}\n`);

console.log("[4/5] Build distribution zip...");
const zipCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${outDir}' -DestinationPath '${zipPath}' -Force"`;
execSync(zipCommand, {
  cwd: projectRoot,
  stdio: "inherit",
  windowsHide: true
});

console.log("[5/5] Done.");
console.log(`Distribution folder: ${outDir}`);
console.log(`Distribution zip: ${zipPath}`);
console.log("");
console.log("✨ 已生成单文件分发包，可直接分发给其他 Windows 用户。");
