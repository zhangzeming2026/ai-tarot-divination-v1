import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const releaseRoot = path.join(projectRoot, "release");
const packageName = "ai-diviner-deploy";
const outDir = path.join(releaseRoot, packageName);
const zipPath = path.join(releaseRoot, `${packageName}.zip`);

function run(command) {
  execSync(command, {
    cwd: projectRoot,
    stdio: "inherit",
    windowsHide: true
  });
}

function safeRemove(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function copyRecursive(from, to) {
  fs.cpSync(from, to, { recursive: true, force: true });
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

console.log("[1/5] Build frontend...");
run("npm.cmd run build");

console.log("[2/5] Prepare release directory...");
ensureDir(releaseRoot);
safeRemove(outDir);
ensureDir(outDir);

console.log("[3/5] Copy runtime files...");
copyRecursive(path.join(projectRoot, "dist"), path.join(outDir, "dist"));
copyRecursive(path.join(projectRoot, "server"), path.join(outDir, "server"));
copyRecursive(path.join(projectRoot, "image"), path.join(outDir, "image"));

const envExamplePath = path.join(projectRoot, ".env.example");
if (fs.existsSync(envExamplePath)) {
  copyRecursive(envExamplePath, path.join(outDir, ".env.example"));
}

const deployPackageJson = {
  name: "ai-diviner-deploy",
  private: true,
  type: "module",
  scripts: {
    start: "node server/index.js"
  },
  dependencies: {
    cors: "^2.8.5",
    dotenv: "^16.4.7",
    express: "^4.21.2"
  }
};

writeText(path.join(outDir, "package.json"), `${JSON.stringify(deployPackageJson, null, 2)}\n`);

const deployReadme = [
  "# AI Diviner Deployment Package",
  "",
  "## Quick Start",
  "",
  "1. Copy .env.example to .env and configure OPENAI_API_KEY.",
  "2. Double-click deploy.bat for first-time deployment.",
  "3. Open http://localhost:8787 after startup.",
  "",
  "## Scripts",
  "",
  "- deploy.bat: Install dependencies and start service.",
  "- start.bat: Start service directly (after dependencies installed)."
].join("\n");

writeText(path.join(outDir, "README_DEPLOY.md"), `${deployReadme}\n`);

const deployBat = [
  "@echo off",
  "chcp 65001 >nul",
  "cd /d %~dp0",
  "if not exist .env if exist .env.example copy /Y .env.example .env >nul",
  "echo Installing dependencies...",
  "call npm.cmd install --omit=dev",
  "if errorlevel 1 (",
  "  echo Dependency installation failed.",
  "  pause",
  "  exit /b 1",
  ")",
  "echo Starting AI Diviner...",
  "call npm.cmd run start",
  "pause"
].join("\r\n");

writeText(path.join(outDir, "deploy.bat"), `${deployBat}\r\n`);

const startBat = [
  "@echo off",
  "chcp 65001 >nul",
  "cd /d %~dp0",
  "call npm.cmd run start",
  "pause"
].join("\r\n");

writeText(path.join(outDir, "start.bat"), `${startBat}\r\n`);

console.log("[4/5] Build deployment zip...");
safeRemove(zipPath);
const zipCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipPath}' -Force"`;
run(zipCommand);

console.log("[5/5] Done.");
console.log(`Package directory: ${outDir}`);
console.log(`Package zip: ${zipPath}`);
