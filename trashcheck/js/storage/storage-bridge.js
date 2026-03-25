// ── Storage Bridge ──
// Single point of contact between the game and the main app's storage.
// Handles localStorage and window.AvatarStore fallback.

const HS_KEY = 'sortierblitz_hs';
const COINS_KEY = 'tb_coins';

export function getHighscore() {
  return parseInt(localStorage.getItem(HS_KEY) || '0');
}

export function setHighscore(score) {
  localStorage.setItem(HS_KEY, String(score));
}

export function getCoins() {
  if (window.AvatarStore) {
    return window.AvatarStore.getCoins();
  }
  return parseInt(localStorage.getItem(COINS_KEY) || '0');
}

export function setCoins(amount) {
  localStorage.setItem(COINS_KEY, String(amount));
}

export function addCoins(amount) {
  const current = getCoins();
  setCoins(current + amount);
}
