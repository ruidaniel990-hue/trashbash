// ── Hotspot Manager ──
// Manages the current hotspot context for gameplay.

import { HOTSPOTS, getHotspotById } from './hotspot-data.js';
import { CATEGORIES } from '../core/game-data.js';

let currentHotspot = null;

export function setCurrentHotspot(hotspot) {
  currentHotspot = hotspot;
}

export function getCurrentHotspot() {
  return currentHotspot;
}

// Returns the 3 category keys for the given hotspot
export function getHotspotBins(hotspot) {
  return hotspot.categories.slice(0, 3);
}

// Build bin display data for preview screen
export function getHotspotBinPreview(hotspot) {
  const arrows = ['◀ LINKS', '⬇ MITTE', 'RECHTS ▶'];
  return hotspot.categories.map((key, i) => {
    const cat = CATEGORIES[key];
    return {
      key,
      name: cat.name,
      icon: cat.icon,
      cls: cat.cls,
      direction: arrows[i],
    };
  });
}
