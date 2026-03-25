// ── Level Manager ──
// Handles level progression and difficulty scaling based on level definitions.

import { getLevelDef, getHotspotForLevel } from './level-definitions.js';
import { CONFIG } from '../core/game-config.js';

// Get fall time for a specific level (base + level-specific bonus)
export function getLevelFallTime(level) {
  const def = getLevelDef(level);
  return Math.max(CONFIG.MIN_FALL_TIME, CONFIG.BASE_FALL_TIME + def.fallTimeBonus);
}

// Get spawn delay for a specific level
export function getLevelSpawnDelay(level) {
  const def = getLevelDef(level);
  return Math.max(CONFIG.MIN_SPAWN_DELAY, CONFIG.BASE_SPAWN_DELAY + def.spawnDelayBonus);
}

// Get how many correct sorts needed to complete this level
export function getItemsToComplete(level) {
  return getLevelDef(level).itemsToComplete;
}

// Check if the hotspot changes between two levels
export function hotspotChanges(fromLevel, toLevel) {
  const fromHotspot = getHotspotForLevel(fromLevel);
  const toHotspot = getHotspotForLevel(toLevel);
  return fromHotspot.id !== toHotspot.id;
}
