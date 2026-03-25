// ── Level Definitions ──
// Each level maps to a hotspot and defines difficulty scaling.
// The game progresses through these levels sequentially.

import { HOTSPOTS } from '../hotspot/hotspot-data.js';

export const LEVELS = [
  // Level 1-2: Easy hotspots
  { level: 1, hotspotId: 'park',       itemsToComplete: 8,  fallTimeBonus: 0,    spawnDelayBonus: 0   },
  { level: 2, hotspotId: 'spielplatz', itemsToComplete: 10, fallTimeBonus: -200,  spawnDelayBonus: -30 },
  // Level 3-4: Medium
  { level: 3, hotspotId: 'strasse',    itemsToComplete: 12, fallTimeBonus: -400,  spawnDelayBonus: -60 },
  { level: 4, hotspotId: 'festival',   itemsToComplete: 14, fallTimeBonus: -600,  spawnDelayBonus: -90 },
  // Level 5: Hard
  { level: 5, hotspotId: 'industrie',  itemsToComplete: 16, fallTimeBonus: -900,  spawnDelayBonus: -120 },
  // Level 6+: Cycle back with increasing speed
  { level: 6, hotspotId: 'park',       itemsToComplete: 16, fallTimeBonus: -1000, spawnDelayBonus: -140 },
  { level: 7, hotspotId: 'strasse',    itemsToComplete: 18, fallTimeBonus: -1100, spawnDelayBonus: -150 },
  { level: 8, hotspotId: 'festival',   itemsToComplete: 18, fallTimeBonus: -1200, spawnDelayBonus: -160 },
  { level: 9, hotspotId: 'industrie',  itemsToComplete: 20, fallTimeBonus: -1300, spawnDelayBonus: -170 },
  { level: 10, hotspotId: 'industrie', itemsToComplete: 20, fallTimeBonus: -1400, spawnDelayBonus: -180 },
];

// For levels beyond the defined list, repeat the last level with max difficulty
export function getLevelDef(level) {
  if (level <= LEVELS.length) {
    return LEVELS[level - 1];
  }
  // Endless mode: repeat last definition with capped difficulty
  const last = LEVELS[LEVELS.length - 1];
  return { ...last, level, itemsToComplete: 20 };
}

export function getHotspotForLevel(level) {
  const def = getLevelDef(level);
  return HOTSPOTS.find(h => h.id === def.hotspotId) || HOTSPOTS[0];
}
