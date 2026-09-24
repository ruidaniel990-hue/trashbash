// ── Scene ──
// Hotspot-themed backdrop: sky + silhouette (CSS via data-scene) and ambient particles.

const AMBIENT = {
  park:       { cls: 'firefly', count: 14 },
  spielplatz: { cls: 'dust',    count: 10 },
  strasse:    { cls: 'rain',    count: 22 },
  festival:   { cls: 'confetti', count: 18 },
  industrie:  { cls: 'ember',   count: 14 },
};

function fillAmbient(layer, sceneId) {
  const cfg = AMBIENT[sceneId];
  layer.innerHTML = '';
  if (!cfg) return;
  for (let i = 0; i < cfg.count; i++) {
    const p = document.createElement('i');
    p.className = 'amb amb-' + cfg.cls;
    p.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
    p.style.setProperty('--y', (Math.random() * 70 + 5).toFixed(1) + '%');
    p.style.setProperty('--d', (Math.random() * 6 + 4).toFixed(2) + 's');
    p.style.setProperty('--delay', (-Math.random() * 10).toFixed(2) + 's');
    p.style.setProperty('--h', Math.floor(Math.random() * 360));
    layer.appendChild(p);
  }
}

export function applyScene(screenId, sceneId) {
  const screen = document.getElementById(screenId);
  if (!screen || screen.dataset.scene === sceneId) return;
  screen.dataset.scene = sceneId;
  let layer = screen.querySelector(':scope > .scene-ambient');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'scene-ambient';
    layer.setAttribute('aria-hidden', 'true');
    screen.prepend(layer);
  }
  fillAmbient(layer, sceneId);
}
