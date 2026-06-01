// Slot symbols — higher weight = more common
const SYMBOLS = [
  { emoji: '🍒', weight: 40, multiplier: 2 },
  { emoji: '🍋', weight: 32, multiplier: 3 },
  { emoji: '🍊', weight: 22, multiplier: 4 },
  { emoji: '🍇', weight: 15, multiplier: 5 },
  { emoji: '💎', weight: 8,  multiplier: 8 },
  { emoji: '7️⃣',  weight: 3,  multiplier: 15 },
];

function weightedRandom(symbols) {
  const total = symbols.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const sym of symbols) {
    r -= sym.weight;
    if (r <= 0) return sym;
  }
  return symbols[symbols.length - 1];
}

function spinSlots(hasLuckyCharm = false) {
  const symbols = hasLuckyCharm
    ? SYMBOLS.map((s, i) => ({ ...s, weight: s.weight + i * 2 }))
    : SYMBOLS;

  const reels = [weightedRandom(symbols), weightedRandom(symbols), weightedRandom(symbols)];
  const emojis = reels.map((r) => r.emoji);

  let multiplier = 0;
  let label = 'No match — better luck next time!';
  let resultType = 'lose';

  if (emojis[0] === emojis[1] && emojis[1] === emojis[2]) {
    multiplier = reels[0].multiplier;
    label = `🎉 JACKPOT! Three ${emojis[0]} — **${multiplier}x** payout!`;
    resultType = 'jackpot';
  } else if (emojis[0] === emojis[1] || emojis[1] === emojis[2] || emojis[0] === emojis[2]) {
    multiplier = 1.5;
    label = `Two of a kind! **1.5x** payout!`;
    resultType = 'partial';
  }

  return { emojis, multiplier, label, resultType };
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function flipCoin() {
  return Math.random() < 0.5 ? 'heads' : 'tails';
}

function doubleOrNothing(hasLuckyCharm = false) {
  return Math.random() < (hasLuckyCharm ? 0.53 : 0.50);
}

// 50% fail | 30% partial (half loot) | 20% full rob
function robAttempt() {
  const r = Math.random();
  if (r < 0.50) return 'fail';
  if (r < 0.80) return 'partial';
  return 'full';
}

const DICE_EMOJIS = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

module.exports = { spinSlots, rollDice, flipCoin, doubleOrNothing, robAttempt, DICE_EMOJIS };
