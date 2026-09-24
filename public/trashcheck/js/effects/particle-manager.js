// ── Particle Manager ──
// Lightweight DOM particle bursts for hits, combos and level-ups.

const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const CONFETTI = ['#ffd23f', '#3fd0ff', '#2ee59d', '#ff6fb5', '#ff8a3d'];

function layer() {
  let el = document.getElementById('fx-layer');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fx-layer';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  return el;
}

export function emitParticles(x, y, { color = '#ffffff', count = 14, spread = 90, rise = 60, confetti = false } = {}) {
  if (REDUCED) count = Math.ceil(count / 3);
  const host = layer();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.4;
    const dist = spread * (0.45 + Math.random() * 0.75);
    p.className = 'pt' + (confetti ? ' pt-confetti' : Math.random() < 0.3 ? ' pt-star' : '');
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--c', confetti ? CONFETTI[i % CONFETTI.length] : color);
    p.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
    p.style.setProperty('--dy', (Math.sin(angle) * dist - rise * Math.random()).toFixed(1) + 'px');
    p.style.setProperty('--r', Math.round(Math.random() * 540 - 270) + 'deg');
    p.style.setProperty('--s', (0.6 + Math.random() * 0.9).toFixed(2));
    p.style.setProperty('--t', (520 + Math.random() * 380).toFixed(0) + 'ms');
    host.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

export function burstAt(el, opts) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  emitParticles(r.left + r.width / 2, r.top + r.height * 0.25, opts);
}

export function confettiRain(count = 40) {
  const w = window.innerWidth;
  for (let i = 0; i < 4; i++) {
    emitParticles(w * (0.15 + i * 0.23), window.innerHeight * 0.38, { count: Math.ceil(count / 4), spread: 160, rise: 120, confetti: true });
  }
}

export function clearParticles() {
  const el = document.getElementById('fx-layer');
  if (el) el.innerHTML = '';
}
