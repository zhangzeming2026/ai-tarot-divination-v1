import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const releaseRoot = path.join(projectRoot, "release", "exe");
const exePath = path.join(releaseRoot, "ai-diviner.exe");

function run(command) {
  execSync(command, {
    cwd: projectRoot,
    stdio: "inherit",
    windowsHide: true
  });
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function safeRemove(targetPath) {
  if (fs.existsSync(targetPath)) {
    try {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } catch (error) {
      // If removal fails, try to empty it instead
      if (fs.statSync(targetPath).isDirectory()) {
        const files = fs.readdirSync(targetPath);
        for (const file of files) {
          const filePath = path.join(targetPath, file);
          try {
            fs.rmSync(filePath, { recursive: true, force: true });
          } catch (e) {
            console.warn(`Warning: Could not remove ${filePath}`);
          }
        }
      }
    }
  }
}

function copyFileIfExists(from, to) {
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

console.log("[1/6] Build frontend assets...");
run("npx.cmd vite build");

console.log("[2/6] Ensure pkg dependency...");
run("npm.cmd install -D pkg");

console.log("[3/6] Prepare release folder...");
safeRemove(releaseRoot);
ensureDir(releaseRoot);

console.log("[4/6] Build exe...");
const quotedExePath = `\"${exePath}\"`;
run(`npx.cmd pkg server/index.cjs --targets node18-win-x64 --output ${quotedExePath} --compress GZip`);

console.log("[5/6] Copy dist and image directories...");
// Copy dist directory to exe folder so server can find it
const exeDistDir = path.join(releaseRoot, "dist");
const projectDistDir = path.join(projectRoot, "dist");
if (fs.existsSync(projectDistDir)) {
  safeRemove(exeDistDir);
  fs.cpSync(projectDistDir, exeDistDir, { recursive: true });
}

// Copy image directory to exe folder
const exeImageDir = path.join(releaseRoot, "image"); 
const projectImageDir = path.join(projectRoot, "image");
if (fs.existsSync(projectImageDir)) {
  safeRemove(exeImageDir);
  fs.cpSync(projectImageDir, exeImageDir, { recursive: true });
}
copyFileIfExists(path.join(projectRoot, ".env.example"), path.join(releaseRoot, ".env.example"));

const startBat = [
  "@echo off",
  "if /I \"%~1\" neq \"__min\" (",
  "  start \"\" /min cmd /c \"%~f0\" __min",
  "  exit /b",
  ")",
  "chcp 65001 >nul",
  "cd /d %~dp0",
  "if not exist .env if exist .env.example copy /Y .env.example .env >nul",
  "start \"\" wscript.exe \"%~dp0start-exe.vbs\""
].join("\r\n");
writeText(path.join(releaseRoot, "start-exe.bat"), `${startBat}\r\n`);

const startVbs = [
  "Set shell = CreateObject(\"WScript.Shell\")",
  "Set fso = CreateObject(\"Scripting.FileSystemObject\")",
  "base = fso.GetParentFolderName(WScript.ScriptFullName)",
  "envFile = fso.BuildPath(base, \".env\")",
  "envExample = fso.BuildPath(base, \".env.example\")",
  "If (Not fso.FileExists(envFile)) And fso.FileExists(envExample) Then",
  "  fso.CopyFile envExample, envFile, True",
  "End If",
  "shell.CurrentDirectory = base",
  "shell.Run Chr(34) & fso.BuildPath(base, \"ai-diviner.exe\") & Chr(34), 0, False"
].join("\r\n");
writeText(path.join(releaseRoot, "start-exe.vbs"), `${startVbs}\r\n`);

const readme = [
  "# AI Diviner EXE Package",
  "",
  "## 使用方式",
  "",
  "1. 配置 .env（可由 .env.example 复制后修改 OPENAI_API_KEY）。",
  "2. 双击 start-exe.bat 或 ai-diviner.exe。",
  "3. 程序会自动打开 http://localhost:8787。",
  "",
  "## 注意",
  "",
  "- 首次运行请确保已配置有效 OPENAI_API_KEY。",
  "- 如 8787 端口被占用，请在 .env 中修改 PORT。",
  "- 关闭程序请结束 ai-diviner.exe 进程。"
].join("\n");
writeText(path.join(releaseRoot, "README_EXE.md"), `${readme}\n`);

console.log("[6/6] Done.");
console.log(`EXE path: ${exePath}`);
console.log(`Folder: ${releaseRoot}`);
