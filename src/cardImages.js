// Sprite sheet configuration for Trump.png
// Each card position in the sprite sheet (using background-position)
// Format: cardId -> { row, col } where position is calculated as background-position: (col * cardWidth) (row * cardHeight)

export const CARD_SPRITES = {
  fool: { row: 0, col: 0 },
  magician: { row: 0, col: 1 },
  "high-priestess": { row: 0, col: 2 },
  empress: { row: 0, col: 3 },
  emperor: { row: 0, col: 4 },
  hierophant: { row: 0, col: 5 },
  lovers: { row: 0, col: 6 },
  chariot: { row: 0, col: 7 },
  strength: { row: 0, col: 8 },
  hermit: { row: 0, col: 9 },
  "wheel-of-fortune": { row: 0, col: 10 },
  justice: { row: 1, col: 0 },
  "hanged-man": { row: 1, col: 1 },
  death: { row: 1, col: 2 },
  temperance: { row: 1, col: 3 },
  devil: { row: 1, col: 4 },
  tower: { row: 1, col: 5 },
  star: { row: 1, col: 6 },
  moon: { row: 1, col: 7 },
  sun: { row: 1, col: 8 },
  judgement: { row: 1, col: 9 },
  world: { row: 1, col: 10 }
};

// Sprite sheet dimensions
export const SPRITE_DIMS = {
  cardWidth: 156,      // pixels
  cardHeight: 250,     // pixels
  spritePath: '/image/Trump.png'
};

/**
 * Get background-position style for a card
 * @param {string} cardId - The card key from CARD_SPRITES
 * @returns {string} CSS background-position value like "0px 0px"
 */
export function getCardPosition(cardId) {
  const sprite = CARD_SPRITES[cardId];
  if (!sprite) return '0px 0px';
  
  // Scale factor: card-illustration is ~140px high, original card is 250px high
  const scaleFactor = 140 / SPRITE_DIMS.cardHeight;  // 0.56
  
  const x = -(sprite.col * SPRITE_DIMS.cardWidth * scaleFactor);
  const y = -(sprite.row * SPRITE_DIMS.cardHeight * scaleFactor);
  
  return `${Math.round(x)}px ${Math.round(y)}px`;
}
