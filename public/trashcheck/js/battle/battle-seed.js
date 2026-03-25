// ── Battle Seed ──
// Deterministic pseudo-random number generator (Mulberry32).
// Given the same seed, produces the exact same sequence of items
// so both players in a battle face identical challenges.

import { CATEGORIES, CAT_KEYS } from '../core/game-data.js';
import { BATTLE_CONFIG } from './battle-data.js';

// ── Mulberry32 PRNG ──
// Fast, deterministic 32-bit PRNG. Same seed = same sequence, always.
function mulberry32(seed) {
  let state = seed | 0;
  return function () {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Generate a random seed ──
export function generateSeed() {
  return Math.floor(Math.random() * 2147483647) + 1;
}

// ── Deterministic category selection ──
// Picks 3 categories from the seed, ensuring consistent bin assignment.
export function pickBattleCategories(seed) {
  const rng = mulberry32(seed);
  const shuffled = [...CAT_KEYS];

  // Fisher-Yates shuffle with seeded RNG
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, BATTLE_CONFIG.ACTIVE_BINS);
}

// ── Generate the full item sequence for a battle ──
// Both players see these exact items in this exact order.
export function generateItemSequence(seed, categories) {
  const rng = mulberry32(seed + 1000); // offset seed for item sequence
  const itemCount = BATTLE_CONFIG.ITEMS_PER_ROUND;
  const sequence = [];

  for (let i = 0; i < itemCount; i++) {
    // Pick a random category from the active ones
    const catKey = categories[Math.floor(rng() * categories.length)];
    const cat = CATEGORIES[catKey];

    // Pick a random item from that category
    const item = cat.items[Math.floor(rng() * cat.items.length)];

    sequence.push({
      index: i,
      categoryKey: catKey,
      emoji: item.emoji,
      name: item.name,
    });
  }

  return sequence;
}

// ── Create full battle round data from a seed ──
// This is the complete deterministic setup both players receive.
export function createBattleRound(seed) {
  const categories = pickBattleCategories(seed);
  const itemSequence = generateItemSequence(seed, categories);

  return {
    seed,
    categories,
    itemSequence,
    config: {
      duration: BATTLE_CONFIG.ROUND_DURATION,
      fallTime: BATTLE_CONFIG.FALL_TIME,
      spawnDelay: BATTLE_CONFIG.SPAWN_DELAY,
      itemCount: BATTLE_CONFIG.ITEMS_PER_ROUND,
    },
  };
}

// ── Verify seed integrity ──
// Can be used to check that a player's reported seed matches the match seed.
export function verifySeedIntegrity(seed, reportedCategories, reportedFirstItem) {
  const round = createBattleRound(seed);

  const catsMatch = JSON.stringify(round.categories) === JSON.stringify(reportedCategories);
  const firstItemMatch = round.itemSequence[0]?.emoji === reportedFirstItem;

  return catsMatch && firstItemMatch;
}
