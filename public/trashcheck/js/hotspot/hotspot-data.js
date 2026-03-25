// ── Hotspot Definitions ──
// Each hotspot = a location with its own trash mix, theme, and difficulty.
// categories: exactly 3 category keys that are active at this hotspot.

export const HOTSPOTS = [
  {
    id: 'park',
    name: 'Stadtpark',
    icon: '🌳',
    description: 'Grüne Wiesen, voller Picknick-Reste',
    categories: ['bio', 'papier', 'rest'],
    difficulty: 1,
    background: '#0a1a0e',  // dark green tint
  },
  {
    id: 'spielplatz',
    name: 'Spielplatz',
    icon: '🎢',
    description: 'Zwischen Rutschen und Sandkästen',
    categories: ['gelb', 'rest', 'bio'],
    difficulty: 1,
    background: '#1a150a',  // warm dark
  },
  {
    id: 'strasse',
    name: 'Hauptstraße',
    icon: '🏙️',
    description: 'Hektik, Verpackungen und Glasflaschen',
    categories: ['gelb', 'glas', 'papier'],
    difficulty: 2,
    background: '#0a0e1a',  // default dark blue
  },
  {
    id: 'festival',
    name: 'Stadtfest',
    icon: '🎪',
    description: 'Party-Chaos und jede Menge Müll',
    categories: ['gelb', 'glas', 'rest'],
    difficulty: 3,
    background: '#1a0a1a',  // purple tint
  },
  {
    id: 'industrie',
    name: 'Industriegebiet',
    icon: '🏭',
    description: 'Vorsicht – hier liegt auch Sondermüll!',
    categories: ['sonder', 'rest', 'gelb'],
    difficulty: 4,
    background: '#1a0e0a',  // dark orange tint
  },
];

export function getHotspotById(id) {
  return HOTSPOTS.find(h => h.id === id) || null;
}
