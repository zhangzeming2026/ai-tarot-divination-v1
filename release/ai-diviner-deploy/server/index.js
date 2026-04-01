import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.resolve(projectRoot, "dist");
const imageDir = path.resolve(projectRoot, "image");
const hasDist = fs.existsSync(distDir);

app.use(cors());
app.use(express.json());
app.use("/image", express.static(imageDir));

if (hasDist) {
  app.use(express.static(distDir));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ai-diviner-api" });
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
    const outputText = data?.choices?.[0]?.message?.content;

    if (!outputText) {
      return res.status(502).json({ error: "模型返回为空" });
    }

    let reading;
    try {
      if (typeof outputText === "string") {
        reading = JSON.parse(outputText);
      } else if (Array.isArray(outputText)) {
        const textPart = outputText.find((item) => item?.type === "text")?.text;
        reading = JSON.parse(textPart || "{}");
      } else {
        reading = outputText;
      }
    } catch {
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

    return res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`AI Diviner API listening on http://localhost:${port}`);
});
