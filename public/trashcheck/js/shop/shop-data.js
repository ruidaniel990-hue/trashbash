// ── Shop Data ──
// Item catalog: upgrades and cosmetics with prices, effects, and slots.
// soloEffect: active in solo/story mode only
// battleEffect: null = no battle advantage (fairness). If set, values are capped.

export const ITEM_TYPES = {
  UPGRADE: 'upgrade',
  COSMETIC: 'cosmetic',
};

export const RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
};

export const SLOTS = {
  HANDS: 'hands',
  HEAD: 'head',
  BACK: 'back',
  OUTFIT: 'outfit',
};

export const SHOP_ITEMS = [
  // ── Hands ──
  {
    id: 'gloves_basic',
    name: 'Arbeitshandschuhe',
    icon: '🧤',
    description: 'Sortiere schneller und bekomme mehr Zeit.',
    price: 80,
    type: ITEM_TYPES.UPGRADE,
    slot: SLOTS.HANDS,
    rarity: RARITIES.COMMON,
    soloEffect: { timeBonusCorrect: 0.2 },
    battleEffect: null,
  },
  {
    id: 'gloves_pro',
    name: 'Profi-Handschuhe',
    icon: '🥊',
    description: 'Deutlich mehr Zeitbonus bei korrektem Sortieren.',
    price: 250,
    type: ITEM_TYPES.UPGRADE,
    slot: SLOTS.HANDS,
    rarity: RARITIES.RARE,
    requires: 'gloves_basic',
    soloEffect: { timeBonusCorrect: 0.5 },
    battleEffect: null,
  },

  // ── Head ──
  {
    id: 'scanner_basic',
    name: 'Müll-Scanner',
    icon: '🔍',
    description: 'Schützt einmal pro Level deine Combo.',
    price: 150,
    type: ITEM_TYPES.UPGRADE,
    slot: SLOTS.HEAD,
    rarity: RARITIES.COMMON,
    soloEffect: { comboShield: 1 },
    battleEffect: null,
  },
  {
    id: 'scanner_pro',
    name: 'Profi-Scanner',
    icon: '📡',
    description: 'Schützt dreimal pro Level deine Combo.',
    price: 400,
    type: ITEM_TYPES.UPGRADE,
    slot: SLOTS.HEAD,
    rarity: RARITIES.EPIC,
    requires: 'scanner_basic',
    soloEffect: { comboShield: 3 },
    battleEffect: null,
  },

  // ── Back ──
  {
    id: 'backpack_basic',
    name: 'Recycling-Rucksack',
    icon: '🎒',
    description: '+5% mehr Coins pro Runde.',
    price: 200,
    type: ITEM_TYPES.UPGRADE,
    slot: SLOTS.BACK,
    rarity: RARITIES.COMMON,
    soloEffect: { coinMultiplier: 1.05 },
    battleEffect: null,
  },
  {
    id: 'backpack_pro',
    name: 'Mega-Rucksack',
    icon: '🧳',
    description: '+15% mehr Coins pro Runde.',
    price: 500,
    type: ITEM_TYPES.UPGRADE,
    slot: SLOTS.BACK,
    rarity: RARITIES.EPIC,
    requires: 'backpack_basic',
    soloEffect: { coinMultiplier: 1.15 },
    battleEffect: null,
  },

  // ── Outfits (cosmetic) ──
  {
    id: 'outfit_eco',
    name: 'Öko-Outfit',
    icon: '🌿',
    description: 'Zeig dein grünes Herz.',
    price: 120,
    type: ITEM_TYPES.COSMETIC,
    slot: SLOTS.OUTFIT,
    rarity: RARITIES.COMMON,
    soloEffect: null,
    battleEffect: null,
  },
  {
    id: 'outfit_neon',
    name: 'Neon-Outfit',
    icon: '💜',
    description: 'Leuchtende Farben für echte Profis.',
    price: 300,
    type: ITEM_TYPES.COSMETIC,
    slot: SLOTS.OUTFIT,
    rarity: RARITIES.RARE,
    soloEffect: null,
    battleEffect: null,
  },
  {
    id: 'outfit_gold',
    name: 'Gold-Outfit',
    icon: '👑',
    description: 'Für die Meister der Mülltrennung.',
    price: 600,
    type: ITEM_TYPES.COSMETIC,
    slot: SLOTS.OUTFIT,
    rarity: RARITIES.EPIC,
    soloEffect: null,
    battleEffect: null,
  },
];

export function getItemById(id) {
  return SHOP_ITEMS.find(item => item.id === id) || null;
}

export function getItemsBySlot(slot) {
  return SHOP_ITEMS.filter(item => item.slot === slot);
}

export function getItemsByType(type) {
  return SHOP_ITEMS.filter(item => item.type === type);
}
