// ── Coin Manager ──
// Manages coin transactions. Delegates persistence to storage-bridge.

import { getCoins, addCoins as storageAddCoins } from '../storage/storage-bridge.js';
import { calculateCoins } from '../core/game-config.js';

export function getBalance() {
  return getCoins();
}

export function earnCoins(score) {
  const amount = calculateCoins(score);
  storageAddCoins(amount);
  return amount;
}

export function spendCoins(amount) {
  const balance = getCoins();
  if (balance < amount) return false;
  storageAddCoins(-amount);
  return true;
}
