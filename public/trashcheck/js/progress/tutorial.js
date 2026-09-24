// ── Tutorial ──
// Remembers whether the first-run tutorial has been completed.

const KEY = 'tc_tutorial_done';

export function isTutorialDone() {
  try { return localStorage.getItem(KEY) === '1'; } catch { return true; }
}

export function markTutorialDone() {
  try { localStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ }
}

export function resetTutorial() {
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}
