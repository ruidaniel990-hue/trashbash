// ── Coin Manager ──
// Manages coin transactions. Delegates persistence to storage-bridge.

import { getCoins, addCoins as storageAddCoins } from '../storage/storage-bridge.js';
import { calculateCoins } from '../core/game-config.js';

export function getBalance() {
  return getCoins();
}

export function earnCoins(score, multiplier = 1) {
  const amount = Math.round(calculateCoins(score) * multiplier);
  storageAddCoins(amount);
  return amount;
}

export function grantBonus(amount) {
  storageAddCoins(amount);
  return amount;
}

export function spendCoins(amount) {
  const balance = getCoins();
  if (balance < amount) return false;
  storageAddCoins(-amount);
  return true;
}
