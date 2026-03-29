import fs from 'fs';

const filePath = 'src/main.js';
let content = fs.readFileSync(filePath, 'utf8');

// 只需要替换循环体部分
const before = `  for (let pos = 0; pos < 3; pos += 1) {
    const startTime = Date.now();
    const deck = [...DECK];

    while (Date.now() - startTime < cycleDuration) {
      // 随机选择一张卡牌显示
      const randomIdx = Math.floor(Math.random() * deck.length);
      const randomCard = deck[randomIdx];
      const orientation = Math.random() < 0.5 ? "upright" : "reversed";

      state.cards[pos] = {
        ...state.cards[pos],
        ...randomCard,
        arcanaType: MAJOR_IDS.has(randomCard.id) ? "大阿卡那" : "小阿卡那",
        position: POSITIONS[pos],
        orientation,
        meaning: orientation === "upright" ? randomCard.upright : randomCard.reversed,
        imageUrl: \`/image/\${encodeURIComponent(randomCard.imageFile)}\`,
        revealed: true
      };
      renderCards();

      await sleep(cycleInterval);
    }

    // 旋转结束后显示最终选中的卡牌
    state.cards[pos] = { ...finalCards[pos], revealed: true };
    renderCards();
    await sleep(400);
  }`;

const after = `  for (let pos = 0; pos < 3; pos += 1) {
    const startTime = Date.now();
    const deck = [...DECK];
    const baseCard = state.cards[pos]; // 保存原始框架信息

    while (Date.now() - startTime < cycleDuration) {
      // 随机选择一张卡牌的图像
      const randomIdx = Math.floor(Math.random() * deck.length);
      const randomCard = deck[randomIdx];

      // 只改变图像，保持框架不变
      state.cards[pos] = {
        ...baseCard,
        imageFile: randomCard.imageFile,
        imageUrl: \`/image/\${encodeURIComponent(randomCard.imageFile)}\`,
        revealed: true
      };
      renderCards();

      await sleep(cycleInterval);
    }

    // 旋转结束后显示最终选中的卡牌
    state.cards[pos] = { ...finalCards[pos], revealed: true };
    renderCards();
    await sleep(400);
  }`;

if (content.includes(before)) {
  content = content.replace(before, after);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('修改成功');
} else {
  console.log('没有找到需要替换的代码');
  process.exit(1);
}
