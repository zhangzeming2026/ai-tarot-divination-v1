import fs from 'fs';

const filePath = 'src/main.js';
let content = fs.readFileSync(filePath, 'utf8');

// 用更精确的短字符串替换
const oldCode = `const deck = [...DECK];

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
      };`;

const newCode = `const deck = [...DECK];
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
      };`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('修改成功！');
} else {
  console.log('代码段查找失败');
  console.log('尝试查找简单的标志...');
  
  if (content.includes('arcanaType: MAJOR_IDS.has(randomCard.id)')) {
    console.log('找到了旧的占卜代码');
    // 使用正则表达式替换
    const regex = /const deck = \[\...DECK\];\s+while \(Date\.now\(\) - startTime < cycleDuration\) \{\s+\/\/ 随机选择一张卡牌显示\s+const randomIdx = Math\.floor\(Math\.random\(\) \* deck\.length\);\s+const randomCard = deck\[randomIdx\];\s+const orientation = Math\.random\(\) < 0\.5 \? "upright" : "reversed";\s+state\.cards\[pos\] = \{\s+\.\.\.state\.cards\[pos\],\s+\.\.\.randomCard,\s+arcanaType: MAJOR_IDS\.has\(randomCard\.id\) \? "大阿卡那" : "小阿卡那",\s+position: POSITIONS\[pos\],\s+orientation,\s+meaning: orientation === "upright" \? randomCard\.upright : randomCard\.reversed,\s+imageUrl: `\/image\/\${encodeURIComponent\(randomCard\.imageFile\)}`/;
    
    if (regex.test(content)) {
      console.log('正则匹配成功');
    } else {
      console.log('正则匹配失败，尝试手动编辑');
    }
  }
  process.exit(1);
}
