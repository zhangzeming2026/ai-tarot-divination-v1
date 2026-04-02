import "./styles.css";
import { drawThreeCards, getDefaultDeckMode, DECK } from "./tarot.js";

const app = document.querySelector("#app");

const state = {
  deckMode: getDefaultDeckMode(),
  cards: [],
  reading: null,
  drawing: false,
  loading: false,
  selectionActive: false,
  selectedPositions: [false, false, false],
  pendingCards: [],
  selectingPosition: null,
  currentQuestion: ""
};

const clientSessionId =
  (window.crypto && typeof window.crypto.randomUUID === "function")
    ? window.crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
let heartbeatTimer = null;

function sendSessionPing() {
  return fetch("/api/session/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: clientSessionId }),
    keepalive: true
  }).catch(() => {});
}

function sendSessionCloseBeacon() {
  const payload = JSON.stringify({ sessionId: clientSessionId });
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/session/close", blob);
    return;
  }

  fetch("/api/session/close", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  }).catch(() => {});
}

function initAutoShutdownHeartbeat() {
  void sendSessionPing();
  heartbeatTimer = window.setInterval(() => {
    void sendSessionPing();
  }, 5000);

  window.addEventListener("beforeunload", sendSessionCloseBeacon);
  window.addEventListener("pagehide", sendSessionCloseBeacon);
}

app.innerHTML = `
  <div class="sky"></div>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">STAR VEIL ORACLE</p>
      <h1>星渊秘语 · 塔罗占卜</h1>
      <p class="subtitle">在深空与金纹之间，抽取三张牌，聆听关于你问题的答案。</p>
    </section>

    <div class="page-left">
      <section class="panel ask-panel">
       
        <textarea id="questionInput" rows="3" placeholder="输入你的诉求。例如：我最近事业运如何？"></textarea>
        <div class="config-row">
          <label for="deckModeSelect"></label>
          <select id="deckModeSelect" aria-label="牌池范围">
            <option value="full">下拉选择牌池范围：完整 78 张（大阿卡那 + 小阿卡那）</option>
            <option value="major">下拉选择牌池范围：仅 22 张大阿卡那</option>
          </select>
        </div>
        <div class="action-row">
          <button id="startBtn" class="oracle-btn">开始占卜</button>
          <p id="statusLine" class="status-line"></p>
        </div>
      </section>

      <section class="panel cards-panel">
        <h2>三张指引牌阵</h2>
        <div id="cardsGrid" class="cards-grid"></div>
      </section>
    </div>

    <div class="page-right">
      <section class="panel reading-panel" id="readingPanel">
        <h2>占卜解读</h2>
        <div id="readingContent" class="reading-content"></div>
      </section>
    </div>
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

// 初始化显示默认卡牌
function initializeDefaultCards() {
  state.cards = [
    {
      id: "default-1",
      arcana: "—",
      arcanaType: "占卜",
      name: "第一张牌",
      imageFile: "roses.png",
      position: "过去的根源",
      orientation: "upright",
      meaning: "",
      symbol: "✦",
      imageUrl: "/image/roses.png",
      revealed: true
    },
    {
      id: "default-2",
      arcana: "—",
      arcanaType: "占卜",
      name: "第二张牌",
      imageFile: "roses.png",
      position: "当下的课题",
      orientation: "upright",
      meaning: "",
      symbol: "✦",
      imageUrl: "/image/roses.png",
      revealed: true
    },
    {
      id: "default-3",
      arcana: "—",
      arcanaType: "占卜",
      name: "第三张牌",
      imageFile: "roses.png",
      position: "未来的走向",
      orientation: "upright",
      meaning: "",
      symbol: "✦",
      imageUrl: "/image/roses.png",
      revealed: true
    }
  ];
  renderCards();
}

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
cardsGrid.addEventListener("click", handleCardGridClick);

function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.classList.toggle("is-error", isError);
}

function renderCards() {
  cardsGrid.innerHTML = state.cards
    .map(
      (card, index) => {
        const displayArcana = card.displayArcana ?? card.arcana;
        const displayArcanaType = card.displayArcanaType ?? card.arcanaType;
        const displayName = card.displayName ?? card.name;
        const displayOrientation = card.displayOrientation ?? card.orientation;
        const displayPosition = card.displayPosition ?? card.position;
        const displaySymbol = card.displaySymbol ?? card.symbol;

        return `
      <article class="tarot-card ${card.revealed ? "revealed" : ""}" data-index="${index}" style="--delay:${index * 250}ms">
        <div class="card-inner">
          <div class="card-face card-back">
            <span>✦</span>
          </div>
          <div class="card-face card-front">
            <div class="card-meta">
              <div class="card-glyph">${displayArcana}</div>
              <span class="arcana-badge ${displayArcanaType === "大阿卡那" ? "major" : "minor"}">${displayArcanaType}</span>
            </div>
            <div class="card-illustration ${displayOrientation === "reversed" ? "is-reversed" : ""}">
              <span class="card-symbol">${displaySymbol}</span>
              <img class="card-image" src="${card.imageUrl}" alt="${displayName}" loading="lazy" data-image-file="${card.imageFile}" />
            </div>
            <h3>${displayName}</h3>
            <p class="orientation">${displayOrientation === "upright" ? "正位" : "逆位"}</p>
            <p class="position">${displayPosition}</p>
          </div>
        </div>
      </article>
    `;
      }
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

function updateCardImageAtPosition(positionIndex, imageFile, altText) {
  const article = cardsGrid.querySelectorAll(".tarot-card")[positionIndex];
  if (!article) {
    return;
  }

  const image = article.querySelector(".card-image");
  if (!image) {
    return;
  }

  image.dataset.fallbackApplied = "0";
  image.classList.remove("is-fallback");
  image.dataset.imageFile = imageFile;
  image.alt = altText;
  image.onerror = () => {
    if (image.dataset.fallbackApplied === "1") {
      return;
    }

    image.dataset.fallbackApplied = "1";
    image.classList.add("is-fallback");
    image.src = createFallbackImageDataUrl(image.dataset.imageFile || "unknown-file.png");
  };
  image.src = `/image/${encodeURIComponent(imageFile)}`;
}

function updateCardDisplayAtPosition(positionIndex, card) {
  const article = cardsGrid.querySelectorAll(".tarot-card")[positionIndex];
  if (!article) {
    return;
  }

  const glyph = article.querySelector(".card-glyph");
  const badge = article.querySelector(".arcana-badge");
  const title = article.querySelector("h3");
  const orientation = article.querySelector(".orientation");
  const position = article.querySelector(".position");
  const symbol = article.querySelector(".card-symbol");
  const illustration = article.querySelector(".card-illustration");

  if (glyph) {
    glyph.textContent = card.displayArcana ?? card.arcana ?? "—";
  }

  if (badge) {
    const arcanaType = card.displayArcanaType ?? card.arcanaType ?? "占卜";
    badge.textContent = arcanaType;
    badge.classList.toggle("major", arcanaType === "大阿卡那");
    badge.classList.toggle("minor", arcanaType !== "大阿卡那");
  }

  if (title) {
    title.textContent = card.displayName ?? card.name ?? "塔罗牌";
  }

  if (orientation) {
    const orientationValue = card.displayOrientation ?? card.orientation ?? "upright";
    orientation.textContent = orientationValue === "upright" ? "正位" : "逆位";
  }

  if (position) {
    position.textContent = card.displayPosition ?? card.position ?? "";
  }

  if (symbol) {
    symbol.textContent = card.displaySymbol ?? card.symbol ?? "✦";
  }

  if (illustration) {
    const orientationValue = card.displayOrientation ?? card.orientation ?? "upright";
    illustration.classList.toggle("is-reversed", orientationValue === "reversed");
  }
}

function formatReadingTitle(title) {
  const rawTitle = String(title || "").trim();
  const match = rawTitle.match(/^(.*?)(（[^）]+）|\([^)]*\))$/);

  if (!match) {
    return escapeXmlText(rawTitle);
  }

  const mainTitle = escapeXmlText(match[1].trim());
  const orientationTitle = escapeXmlText(match[2].trim());

  return `${mainTitle}<span class="reading-title-orientation">${orientationTitle}</span>`;
}

function renderReading() {
  if (!state.reading) {
    readingPanel.hidden = false;
    readingContent.classList.add("is-placeholder");
    readingContent.innerHTML = `
      <p class="overview">请输入你的诉求并完成三张卡牌选取后，这里将显示占卜解读。</p>
      <div class="per-card">
        <article>
          <h3>第一张卡牌解读</h3>
          <p>等待抽取与解读...</p>
        </article>
        <article>
          <h3>第二张卡牌解读</h3>
          <p>等待抽取与解读...</p>
        </article>
        <article>
          <h3>第三张卡牌解读</h3>
          <p>等待抽取与解读...</p>
        </article>
      </div>
      <article class="advice">
        <h3>建议</h3>
        <p>等待抽取与解读...</p>
      </article>
    `;
    return;
  }

  readingPanel.hidden = false;
  readingContent.classList.remove("is-placeholder");
  readingContent.innerHTML = `
    <p class="overview">${state.reading.overall}</p>
    <div class="per-card">
      ${state.reading.perCard
        .map(
          (item) => `
            <article>
              <h3>${formatReadingTitle(item.title)}</h3>
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

function handleCardGridClick(event) {
  if (!state.selectionActive) {
    return;
  }

  const cardElement = event.target.closest(".tarot-card");
  if (!cardElement || !cardsGrid.contains(cardElement)) {
    return;
  }

  const index = Number(cardElement.dataset.index);
  if (Number.isNaN(index)) {
    return;
  }

  if (state.selectingPosition !== null) {
    setStatus("正在抽取当前牌位，请稍候...");
    return;
  }

  if (state.selectedPositions[index]) {
    setStatus("该牌位已选定，请点击其他牌位。", false);
    return;
  }

  void selectCardAtPosition(index);
}

async function selectCardAtPosition(positionIndex) {
  if (!state.selectionActive || state.selectingPosition !== null) {
    return;
  }

  const finalCard = state.pendingCards[positionIndex];
  if (!finalCard) {
    return;
  }

  state.selectingPosition = positionIndex;
  setStatus(`正在选取第 ${positionIndex + 1} 张牌...`);

  const cycleDuration = 1200;
  const cycleInterval = 100;
  const startTime = Date.now();
  const deck = [...DECK];
  const baseCard = state.cards[positionIndex];

  while (Date.now() - startTime < cycleDuration) {
    const randomIdx = Math.floor(Math.random() * deck.length);
    const randomCard = deck[randomIdx];

    state.cards[positionIndex] = {
      ...baseCard,
      imageFile: randomCard.imageFile,
      imageUrl: `/image/${encodeURIComponent(randomCard.imageFile)}`,
      revealed: true
    };

    updateCardImageAtPosition(
      positionIndex,
      randomCard.imageFile,
      baseCard.displayName ?? baseCard.name ?? "塔罗牌"
    );

    await sleep(cycleInterval);
  }

  state.cards[positionIndex] = {
    ...state.cards[positionIndex],
    ...finalCard,
    displayArcana: finalCard.arcana,
    displayArcanaType: finalCard.arcanaType,
    displayName: finalCard.name,
    displayOrientation: finalCard.orientation,
    displayPosition: finalCard.position,
    displaySymbol: finalCard.symbol,
    revealed: true
  };

  updateCardDisplayAtPosition(positionIndex, state.cards[positionIndex]);
  updateCardImageAtPosition(
    positionIndex,
    finalCard.imageFile,
    state.cards[positionIndex].displayName ?? state.cards[positionIndex].name ?? "塔罗牌"
  );

  state.selectedPositions[positionIndex] = true;
  state.selectingPosition = null;

  const selectedCount = state.selectedPositions.filter(Boolean).length;
  const remainingCount = 3 - selectedCount;

  if (remainingCount > 0) {
    setStatus(`已选中 ${selectedCount} 张牌，请继续点击其余牌位（剩余 ${remainingCount} 张）。`);
    return;
  }

  state.selectionActive = false;
  state.drawing = false;
  await startAiReading();
}

async function startAiReading() {
  state.loading = true;
  setStatus("三张牌已选定，AI 正在解读...");

  try {
    const reading = await fetchReading(state.currentQuestion, state.cards);
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

async function startDivination() {
  const question = questionInput.value.trim();

  if (!question) {
    setStatus("请先输入你的诉求。", true);
    return;
  }

  if (state.drawing || state.loading) {
    return;
  }

  state.reading = null;
  renderReading();

  state.currentQuestion = question;
  state.selectedPositions = [false, false, false];
  state.pendingCards = [];
  state.selectingPosition = null;
  state.drawing = true;
  state.selectionActive = true;
  startBtn.disabled = true;
  setStatus("点击下方任意卡牌开始选取；三张都选完后将进入 AI 解读。", true);

  // 获取最终选中的3张卡牌
  const finalCards = drawThreeCards(state.deckMode);
  state.pendingCards = finalCards;

  // 锁定外框展示信息，抽牌过程中只切换插画图片
  state.cards = finalCards.map((card, index) => {
    const frameCard = state.cards[index] || {};

    return {
      ...card,
      imageFile: "roses.png",
      imageUrl: "/image/roses.png",
      displayArcana: frameCard.displayArcana ?? frameCard.arcana ?? "—",
      displayArcanaType: frameCard.displayArcanaType ?? frameCard.arcanaType ?? "占卜",
      displayName: frameCard.displayName ?? frameCard.name ?? `第${index + 1}张牌`,
      displayOrientation: frameCard.displayOrientation ?? frameCard.orientation ?? "upright",
      displayPosition: frameCard.displayPosition ?? frameCard.position ?? card.position,
      displaySymbol: frameCard.displaySymbol ?? frameCard.symbol ?? "✦",
      revealed: true
    };
  });
  renderCards();
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

// 页面加载时初始化显示默认卡牌
initializeDefaultCards();
renderReading();
initAutoShutdownHeartbeat();

