// ── Unlocks ──
// Every hotspot a player has reached once can be chosen as the starting point of a run.

import { LEVELS } from '../level/level-definitions.js';
import { HOTSPOTS } from '../hotspot/hotspot-data.js';

const BEST_KEY = 'tc_best_level';
const START_KEY = 'tc_start_spot';

export function getBestLevel() {
  try { return parseInt(localStorage.getItem(BEST_KEY) || '1', 10) || 1; } catch { return 1; }
}

export function recordLevel(level) {
  if (level <= getBestLevel()) return false;
  try { localStorage.setItem(BEST_KEY, String(level)); } catch { /* storage unavailable */ }
  return true;
}

// Hotspots in the order they first appear, with the level where they start.
export function getStartSpots() {
  const best = getBestLevel();
  const firstLevel = new Map();
  for (const def of LEVELS) {
    if (!firstLevel.has(def.hotspotId)) firstLevel.set(def.hotspotId, def.level);
  }
  return [...firstLevel].map(([id, level]) => ({
    ...HOTSPOTS.find(h => h.id === id),
    level,
    unlocked: level <= best,
  }));
}

export function getSelectedStartId() {
  let id = null;
  try { id = localStorage.getItem(START_KEY); } catch { /* storage unavailable */ }
  const spot = getStartSpots().find(s => s.id === id && s.unlocked);
  return spot ? spot.id : 'park';
}

export function setSelectedStart(id) {
  try { localStorage.setItem(START_KEY, id); } catch { /* storage unavailable */ }
}

export function getSelectedStartLevel() {
  const id = getSelectedStartId();
  return getStartSpots().find(s => s.id === id)?.level || 1;
}
