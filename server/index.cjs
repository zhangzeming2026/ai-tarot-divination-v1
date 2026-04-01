const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { buildSystemPrompt, buildUserPrompt } = require("./prompt.cjs");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const isPackagedExe = Boolean(process.pkg);
const clientSessions = new Map();
const HEARTBEAT_TIMEOUT_MS = 15000;
const EXIT_GRACE_MS = 5000;
let exitTimer = null;

function buildMissingFrontendHtml({ isPackagedExe, distDir, hasDist }) {
  const title = "前端资源缺失";
  const details = isPackagedExe
    ? [
        "当前是 EXE 运行模式，但同目录下没有找到 dist 前端资源。",
        "请不要只单独复制 ai-diviner.exe。",
        "请保留整个 release/exe 目录，或重新执行 npm install 与 npm run build:exe。"
      ]
    : [
        "当前仓库缺少 dist 前端资源。",
        "请先在项目根目录执行 npm install 与 npm run build。"
      ];

  const items = details.map((item) => `<li>${item}</li>`).join("");
  const modeLabel = isPackagedExe ? "EXE 模式" : "源码模式";

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        font-family: "Microsoft YaHei", sans-serif;
        background: linear-gradient(180deg, #f6f1e8 0%, #e7dcc9 100%);
        color: #2f2418;
      }
      main {
        max-width: 720px;
        margin: 8vh auto;
        padding: 32px;
        background: rgba(255, 251, 245, 0.9);
        border: 1px solid #d4c4ab;
        border-radius: 18px;
        box-shadow: 0 18px 50px rgba(63, 42, 19, 0.12);
      }
      h1 {
        margin-top: 0;
        font-size: 28px;
      }
      p, li {
        line-height: 1.7;
        font-size: 16px;
      }
      code {
        padding: 2px 6px;
        background: #f0e6d8;
        border-radius: 6px;
      }
      .meta {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px dashed #ccb89a;
        color: #6b563f;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>服务已经启动，但浏览器页面所需的前端文件不存在，所以无法显示占卜界面。</p>
      <ul>${items}</ul>
      <div class="meta">
        <p>运行模式：${modeLabel}</p>
        <p>dist 目录：<code>${distDir || "未找到"}</code></p>
        <p>hasDist：<code>${String(hasDist)}</code></p>
      </div>
    </main>
  </body>
</html>`;
}

function clearExitTimer() {
  if (exitTimer) {
    clearTimeout(exitTimer);
    exitTimer = null;
  }
}

function pruneInactiveSessions() {
  const now = Date.now();
  for (const [sessionId, lastSeen] of clientSessions.entries()) {
    if (now - lastSeen > HEARTBEAT_TIMEOUT_MS) {
      clientSessions.delete(sessionId);
    }
  }
}

function scheduleExitWhenIdle() {
  if (!isPackagedExe) {
    return;
  }

  pruneInactiveSessions();

  if (clientSessions.size > 0) {
    clearExitTimer();
    return;
  }

  if (exitTimer) {
    return;
  }

  exitTimer = setTimeout(() => {
    pruneInactiveSessions();
    if (clientSessions.size === 0) {
      console.log("[INFO] No active browser sessions. Exiting process.");
      process.exit(0);
    }
    exitTimer = null;
  }, EXIT_GRACE_MS);
}

const runtimeRoot = isPackagedExe ? path.dirname(process.execPath) : path.resolve(__dirname, "..");
const snapshotRoot = isPackagedExe ? path.dirname(process.pkg.entrypoint) : runtimeRoot;

// Try multiple possible locations for dist directory
let distDir = null;
const possibleDistPaths = [
  path.join(runtimeRoot, "dist"),
  path.join(snapshotRoot, "dist"),
  path.join(__dirname, "..", "dist")
];

for (const possiblePath of possibleDistPaths) {
  if (fs.existsSync(possiblePath)) {
    distDir = possiblePath;
    break;
  }
}

// Try multiple possible locations for image directory
let imageDir = null;
const possibleImagePaths = [
  path.join(runtimeRoot, "image"),
  path.join(snapshotRoot, "image"),
  path.join(__dirname, "..", "image")
];

for (const possiblePath of possibleImagePaths) {
  if (fs.existsSync(possiblePath)) {
    imageDir = possiblePath;
    break;
  }
}

const hasDist = distDir !== null && fs.existsSync(distDir);
console.log(`[DEBUG] isPackagedExe: ${isPackagedExe}, hasDist: ${hasDist}, distDir: ${distDir}, imageDir: ${imageDir}`);

app.use(cors());
app.use(express.json());

// Add detailed logging for image requests
app.use((req, res, next) => {
  if (req.path.startsWith("/image")) {
    console.log(`[IMAGE] Requested: ${req.path}, imageDir: ${imageDir}`);
  }
  next();
});

if (imageDir) {
  console.log(`[INFO] Registering /image static route for: ${imageDir}`);
  app.use("/image", express.static(imageDir));
} else {
  console.log(`[WARNING] imageDir is null, /image route will not be registered`);
}

if (hasDist) {
  app.use(express.static(distDir));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ai-diviner-api" });
});

app.post("/api/session/ping", (req, res) => {
  const sessionId = String((req.body && req.body.sessionId) || "").trim();
  if (!sessionId) {
    return res.status(400).json({ error: "missing sessionId" });
  }

  clientSessions.set(sessionId, Date.now());
  clearExitTimer();
  return res.json({ ok: true });
});

app.post("/api/session/close", (req, res) => {
  const sessionId = String((req.body && req.body.sessionId) || "").trim();
  if (sessionId) {
    clientSessions.delete(sessionId);
  }

  scheduleExitWhenIdle();
  return res.json({ ok: true });
});

app.get("/api/debug", (_req, res) => {
  pruneInactiveSessions();
  // Check if roses.png actually exists
  const rosesPath = imageDir ? path.join(imageDir, "roses.png") : null;
  const rosesExists = rosesPath && fs.existsSync(rosesPath);
  
  res.json({ 
    isPackagedExe, 
    hasDist, 
    distDir,
    imageDir,
    activeSessionCount: clientSessions.size,
    rosesPath,
    rosesExists,
    imageFiles: imageDir && fs.existsSync(imageDir) ? fs.readdirSync(imageDir).slice(0, 5) : []
  });
});

app.post("/api/reading", async (req, res) => {
  try {
    const { question, cards } = req.body || {};

    if (!question || !Array.isArray(cards) || cards.length !== 3) {
      return res.status(400).json({ error: "请求参数不完整：需要 question 和 3 张 cards" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "服务端未配置 OPENAI_API_KEY" });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const system = buildSystemPrompt();
    const user = buildUserPrompt(question, cards);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ error: `模型调用失败：${errorText}` });
    }

    const data = await response.json();
    const outputText = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

    if (!outputText) {
      return res.status(502).json({ error: "模型返回为空" });
    }

    let reading;
    try {
      if (typeof outputText === "string") {
        reading = JSON.parse(outputText);
      } else if (Array.isArray(outputText)) {
        const textPart = outputText.find((item) => item && item.type === "text");
        reading = JSON.parse((textPart && textPart.text) || "{}");
      } else {
        reading = outputText;
      }
    } catch (_error) {
      return res.status(502).json({ error: "模型返回 JSON 解析失败" });
    }

    if (
      !reading ||
      typeof reading.overall !== "string" ||
      !Array.isArray(reading.perCard) ||
      reading.perCard.length !== 3 ||
      typeof reading.advice !== "string"
    ) {
      return res.status(502).json({ error: "模型返回格式不符合预期" });
    }

    return res.json({ reading });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return res.status(500).json({ error: `服务端异常：${message}` });
  }
});

if (hasDist) {
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    const indexPath = path.join(distDir, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    
    return res.status(404).json({ error: "index.html not found in dist" });
  });
} else {
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    return res.status(503).type("html").send(buildMissingFrontendHtml({ isPackagedExe, distDir, hasDist }));
  });
}

app.listen(port, () => {
  console.log(`AI Diviner EXE listening on http://localhost:${port}`);

  if (isPackagedExe) {
    const targetUrl = `http://localhost:${port}`;
    spawn("cmd", ["/c", "start", "", targetUrl], {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    }).unref();

    // If user never opens the page, close EXE automatically after startup grace period.
    scheduleExitWhenIdle();
  }
});
