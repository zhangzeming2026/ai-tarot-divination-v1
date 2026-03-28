import "./styles.css";
import { drawThreeCards, getDefaultDeckMode } from "./tarot.js";

const app = document.querySelector("#app");

const state = {
  deckMode: getDefaultDeckMode(),
  cards: [],
  reading: null,
  drawing: false,
  loading: false
};

app.innerHTML = `
  <div class="sky"></div>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">STAR VEIL ORACLE</p>
      <h1>星渊秘语 · AI 塔罗占卜</h1>
      <p class="subtitle">在深空与金纹之间，抽取三张牌，聆听关于你问题的答案。</p>
    </section>

    <section class="panel ask-panel">
      <label for="questionInput">你的问题</label>
      <textarea id="questionInput" rows="3" placeholder="例如：我最近事业运如何？"></textarea>
      <div class="config-row">
        <label for="deckModeSelect">牌池范围</label>
        <select id="deckModeSelect" aria-label="牌池范围">
          <option value="full">完整 78 张（大阿卡那 + 小阿卡那）</option>
          <option value="major">仅 22 张大阿卡那</option>
        </select>
      </div>
      <button id="startBtn" class="oracle-btn">开始占卜</button>
      <p id="statusLine" class="status-line"></p>
    </section>

    <section class="panel cards-panel">
      <h2>三张指引牌阵</h2>
      <div id="cardsGrid" class="cards-grid"></div>
    </section>

    <section class="panel reading-panel" id="readingPanel" hidden>
      <h2>AI 占卜解读</h2>
      <div id="readingContent" class="reading-content"></div>
    </section>
  </main>
`;

const questionInput = document.querySelector("#questionInput");
const deckModeSelect = document.querySelector("#deckModeSelect");
const startBtn = document.querySelector("#startBtn");
const statusLine = document.querySelector("#statusLine");
const cardsGrid = document.querySelector("#cardsGrid");
const readingPanel = document.querySelector("#readingPanel");
const readingContent = document.querySelector("#readingContent");

deckModeSelect.value = state.deckMode;
deckModeSelect.addEventListener("change", () => {
  state.deckMode = deckModeSelect.value === "major" ? "major" : "full";
});

function escapeXmlText(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createFallbackImageDataUrl(fileName) {
  const label = escapeXmlText(fileName || "unknown-file.png");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#201238"/><stop offset="100%" stop-color="#5b3e22"/></linearGradient></defs><rect width="360" height="560" fill="url(#g)"/><rect x="16" y="16" width="328" height="528" rx="14" fill="none" stroke="#d9b875" stroke-width="3" stroke-opacity="0.8"/><circle cx="180" cy="226" r="62" fill="#f3d897" fill-opacity="0.22"/><text x="180" y="236" text-anchor="middle" font-size="44" fill="#f3d897" fill-opacity="0.88">✦</text><text x="180" y="304" text-anchor="middle" font-size="20" fill="#f6e8c8" fill-opacity="0.88">IMAGE MISSING</text><text x="180" y="334" text-anchor="middle" font-size="12" fill="#f6e8c8" fill-opacity="0.8">${label}</text></svg>`;

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

startBtn.addEventListener("click", startDivination);

function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.classList.toggle("is-error", isError);
}

function renderCards() {
  cardsGrid.innerHTML = state.cards
    .map(
      (card, index) => `
      <article class="tarot-card ${card.revealed ? "revealed" : ""}" style="--delay:${index * 250}ms">
        <div class="card-inner">
          <div class="card-face card-back">
            <span>✦</span>
          </div>
          <div class="card-face card-front">
            <div class="card-meta">
              <div class="card-glyph">${card.arcana}</div>
              <span class="arcana-badge ${card.arcanaType === "大阿卡那" ? "major" : "minor"}">${card.arcanaType}</span>
            </div>
            <div class="card-illustration ${card.orientation === "reversed" ? "is-reversed" : ""}">
              <span class="card-symbol">${card.symbol}</span>
              <img class="card-image" src="${card.imageUrl}" alt="${card.name}" loading="lazy" data-image-file="${card.imageFile}" />
            </div>
            <h3>${card.name}</h3>
            <p class="orientation">${card.orientation === "upright" ? "正位" : "逆位"}</p>
            <p class="position">${card.position}</p>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  attachCardImageFallback();
}

function attachCardImageFallback() {
  const images = cardsGrid.querySelectorAll(".card-image");

  images.forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        if (image.dataset.fallbackApplied === "1") {
          return;
        }

        image.dataset.fallbackApplied = "1";
        image.classList.add("is-fallback");
        image.src = createFallbackImageDataUrl(image.dataset.imageFile || "unknown-file.png");
      },
      { once: true }
    );
  });
}

function renderReading() {
  if (!state.reading) {
    readingPanel.hidden = true;
    return;
  }

  readingPanel.hidden = false;
  readingContent.innerHTML = `
    <p class="overview">${state.reading.overall}</p>
    <div class="per-card">
      ${state.reading.perCard
        .map(
          (item) => `
            <article>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </article>
          `
        )
        .join("")}
    </div>
    <article class="advice">
      <h3>行动建议</h3>
      <p>${state.reading.advice}</p>
    </article>
  `;
}

async function startDivination() {
  const question = questionInput.value.trim();

  if (!question) {
    setStatus("请先输入你想咨询的问题。", true);
    return;
  }

  if (state.drawing || state.loading) {
    return;
  }

  state.reading = null;
  renderReading();

  state.drawing = true;
  startBtn.disabled = true;
  setStatus("正在洗牌并抽牌...");

  const cards = drawThreeCards(state.deckMode);
  state.cards = cards.map((card) => ({ ...card, revealed: false }));
  renderCards();

  for (let i = 0; i < state.cards.length; i += 1) {
    await sleep(600);
    state.cards[i].revealed = true;
    renderCards();
  }

  state.drawing = false;
  state.loading = true;
  setStatus("牌面已显现，AI 正在解读...");

  try {
    const reading = await fetchReading(question, state.cards);
    state.reading = reading;
    setStatus("解读完成。愿你看见更清晰的方向。", false);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "解读失败";
    setStatus(errorMessage, true);
  } finally {
    state.loading = false;
    startBtn.disabled = false;
    renderReading();
  }
}

async function fetchReading(question, cards) {
  const response = await fetch("/api/reading", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question,
      cards: cards.map(({ id, name, orientation, position, meaning }) => ({
        id,
        name,
        orientation,
        position,
        meaning
      }))
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "AI 解读接口返回异常");
  }

  return payload.reading;
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
