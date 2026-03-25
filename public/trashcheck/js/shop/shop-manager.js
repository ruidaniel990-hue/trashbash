// ── Shop Manager ──
// Purchase logic, inventory management, and equipment effects.

import { SHOP_ITEMS, getItemById } from './shop-data.js';
import { getBalance, spendCoins } from '../economy/coin-manager.js';

// Storage keys
const OWNED_KEY = 'trashcheck_owned';
const EQUIPPED_KEY = 'trashcheck_equipped';

// ── Inventory ──

export function getOwnedItems() {
  try {
    return JSON.parse(localStorage.getItem(OWNED_KEY) || '[]');
  } catch { return []; }
}

function setOwnedItems(items) {
  localStorage.setItem(OWNED_KEY, JSON.stringify(items));
}

export function ownsItem(itemId) {
  return getOwnedItems().includes(itemId);
}

// ── Equipment ──

export function getEquipped() {
  try {
    return JSON.parse(localStorage.getItem(EQUIPPED_KEY) || '{}');
  } catch { return {}; }
}

function setEquipped(equipped) {
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(equipped));
}

export function getEquippedInSlot(slot) {
  const equipped = getEquipped();
  return equipped[slot] || null;
}

export function equipItem(itemId) {
  const item = getItemById(itemId);
  if (!item || !ownsItem(itemId)) return false;

  const equipped = getEquipped();
  equipped[item.slot] = itemId;
  setEquipped(equipped);
  return true;
}

export function unequipSlot(slot) {
  const equipped = getEquipped();
  delete equipped[slot];
  setEquipped(equipped);
}

// ── Purchase ──

export function canAfford(itemId) {
  const item = getItemById(itemId);
  if (!item) return false;
  return getBalance() >= item.price;
}

export function canPurchase(itemId) {
  const item = getItemById(itemId);
  if (!item) return { ok: false, reason: 'not_found' };
  if (ownsItem(itemId)) return { ok: false, reason: 'already_owned' };
  if (!canAfford(itemId)) return { ok: false, reason: 'insufficient_coins' };
  if (item.requires && !ownsItem(item.requires)) return { ok: false, reason: 'requires_prerequisite' };
  return { ok: true };
}

export function purchaseItem(itemId) {
  const check = canPurchase(itemId);
  if (!check.ok) return check;

  const item = getItemById(itemId);
  if (!spendCoins(item.price)) return { ok: false, reason: 'spend_failed' };

  const owned = getOwnedItems();
  owned.push(itemId);
  setOwnedItems(owned);

  return { ok: true, item };
}

// ── Active Effects (Solo Mode) ──

export function getActiveEffects() {
  const equipped = getEquipped();
  const effects = {
    timeBonusCorrect: 0,
    comboShield: 0,
    coinMultiplier: 1,
  };

  for (const itemId of Object.values(equipped)) {
    const item = getItemById(itemId);
    if (!item || !item.soloEffect) continue;

    if (item.soloEffect.timeBonusCorrect) {
      effects.timeBonusCorrect += item.soloEffect.timeBonusCorrect;
    }
    if (item.soloEffect.comboShield) {
      effects.comboShield += item.soloEffect.comboShield;
    }
    if (item.soloEffect.coinMultiplier) {
      effects.coinMultiplier *= item.soloEffect.coinMultiplier;
    }
  }

  return effects;
}

// ── Shop Display Data ──

export function getShopDisplayItems() {
  const owned = getOwnedItems();
  const equipped = getEquipped();

  return SHOP_ITEMS.map(item => ({
    ...item,
    owned: owned.includes(item.id),
    equipped: Object.values(equipped).includes(item.id),
    affordable: getBalance() >= item.price,
    purchasable: canPurchase(item.id).ok,
    prerequisiteMet: !item.requires || owned.includes(item.requires),
  }));
}
