// ── Bin View ──
// Wheelie-bin markup (SVG body + hinged lid) shared by the game and preview screens.

import { CATEGORIES } from '../core/game-data.js';
import { iconHtml } from './icons.js';

const DIRECTIONS = [
  { arrow: '←', label: 'Links' },
  { arrow: '↓', label: 'Mitte' },
  { arrow: '→', label: 'Rechts' },
];

const BIN_SVG = `
<svg class="bin-svg" viewBox="0 0 100 112" aria-hidden="true">
  <ellipse class="bin-shadow" cx="50" cy="108" rx="36" ry="4"/>
  <path class="bin-body" d="M14 30 H86 L79.5 97 Q79 103 73 103 H27 Q21 103 20.5 97 Z"/>
  <path class="bin-rib" d="M34 38 L36 94 M50 38 V94 M66 38 L64 94"/>
  <path class="bin-shade" d="M14 30 H86 L85.2 38 H14.8 Z"/>
  <circle class="bin-wheel" cx="28" cy="104" r="6"/>
  <circle class="bin-wheel" cx="72" cy="104" r="6"/>
  <circle class="bin-hub" cx="28" cy="104" r="2"/>
  <circle class="bin-hub" cx="72" cy="104" r="2"/>
  <g class="bin-lid">
    <rect class="bin-lid-top" x="8" y="18" width="84" height="13" rx="4.5"/>
    <rect class="bin-lid-grip" x="38" y="12" width="24" height="7" rx="3"/>
  </g>
</svg>`;

export function binHtml(key, index, id = '') {
  const cat = CATEGORIES[key];
  const dir = DIRECTIONS[index];
  return `<div class="bin ${cat.cls}"${id ? ` id="${id}"` : ''} style="--i:${index}">
    <div class="bin-dir"><span class="bin-dir-arrow">${dir.arrow}</span>${dir.label}</div>
    <div class="bin-art">
      ${BIN_SVG}
      <div class="bin-emblem">${iconHtml(cat.icon)}</div>
    </div>
    <div class="bin-label">${cat.name}</div>
  </div>`;
}
