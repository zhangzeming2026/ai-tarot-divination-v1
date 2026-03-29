import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const releaseDir = path.join(rootDir, "release");
const packageDir = path.join(releaseDir, "ai-diviner-deploy");
const archivePath = path.join(releaseDir, "ai-diviner-deploy.zip");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function quoteWindowsArgument(value) {
  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '\\"')}"`;
}

function run(command, args, cwd = rootDir) {
  const isWindowsScript = process.platform === "win32" && /\.(cmd|bat)$/iu.test(command);
  const result = isWindowsScript
    ? spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `${command} ${args.map(quoteWindowsArgument).join(" ")}`], {
        cwd,
        stdio: "inherit",
        shell: false
      })
    : spawnSync(command, args, {
        cwd,
        stdio: "inherit",
        shell: false
      });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} 执行失败`);
  }
}

async function ensureCleanDirectory(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyPath(from, to) {
  await fs.cp(from, to, { recursive: true, force: true });
}

async function buildDeployManifest() {
  const rootPackagePath = path.join(rootDir, "package.json");
  const rootPackage = JSON.parse(await fs.readFile(rootPackagePath, "utf8"));

  return {
    name: `${rootPackage.name}-deploy`,
    version: rootPackage.version,
    private: true,
    type: rootPackage.type ?? "module",
    scripts: {
      start: "node server/index.js"
    },
    dependencies: rootPackage.dependencies ?? {}
  };
}

function createWindowsArchive(sourceDir, destinationPath) {
  const command = `Compress-Archive -Path '${sourceDir.replace(/'/g, "''")}' -DestinationPath '${destinationPath.replace(/'/g, "''")}' -Force`;
  run("powershell.exe", ["-NoProfile", "-Command", command], rootDir);
}

async function main() {
  console.log("[1/4] 构建前端生产资源...");
  run(npmCommand, ["run", "build"]);

  console.log("[2/4] 准备部署目录...");
  await fs.mkdir(releaseDir, { recursive: true });
  await ensureCleanDirectory(packageDir);

  console.log("[3/4] 复制部署文件...");
  await Promise.all([
    copyPath(path.join(rootDir, "dist"), path.join(packageDir, "dist")),
    copyPath(path.join(rootDir, "server"), path.join(packageDir, "server")),
    copyPath(path.join(rootDir, "image"), path.join(packageDir, "image")),
    copyPath(path.join(rootDir, "deploy"), path.join(packageDir, "deploy")),
    copyPath(path.join(rootDir, ".env.example"), path.join(packageDir, ".env.example")),
    copyPath(path.join(rootDir, "README.md"), path.join(packageDir, "README.md")),
    copyPath(path.join(rootDir, "DEPLOY.md"), path.join(packageDir, "DEPLOY.md"))
  ]);

  const deployPackageJson = await buildDeployManifest();
  await fs.writeFile(path.join(packageDir, "package.json"), `${JSON.stringify(deployPackageJson, null, 2)}\n`, "utf8");

  console.log("[4/4] 生成压缩包...");
  if (existsSync(archivePath)) {
    await fs.rm(archivePath, { force: true });
  }

  if (process.platform === "win32") {
    createWindowsArchive(packageDir, archivePath);
    console.log(`部署压缩包已生成：${archivePath}`);
  } else {
    console.log(`已生成部署目录：${packageDir}`);
    console.log("当前平台未自动生成 zip，请自行压缩 release/ai-diviner-deploy 目录。");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});