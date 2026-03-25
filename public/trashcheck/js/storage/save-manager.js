// ── Save Manager [P2] ──
// Full game state persistence: level progress, inventory, achievements.

const SAVE_KEY = 'trashcheck_save';

export function saveGame(data) {
  // TODO [P2]: Serialize and persist full game state
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
}

export function loadGame() {
  // TODO [P2]: Load and deserialize game state
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Failed to load game:', e);
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
