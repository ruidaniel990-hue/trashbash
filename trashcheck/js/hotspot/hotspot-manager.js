// ── Hotspot Manager ──
// Manages the current hotspot context for gameplay.

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
