// ── Audio Manager ──
// Synthesized sound effects (Web Audio, no files) with a persisted mute toggle.

const MUTE_KEY = 'tc_muted';
let audioCtx = null;
let master = null;
let muted = readMuted();

function readMuted() {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    master = audioCtx.createGain();
    master.gain.value = 0.55;
    master.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Browsers only allow audio after a user gesture.
export function unlockAudio() {
  const once = () => { ctx(); window.removeEventListener('pointerdown', once); window.removeEventListener('keydown', once); };
  window.addEventListener('pointerdown', once);
  window.addEventListener('keydown', once);
}

function tone({ freq, to = freq, type = 'sine', dur = 0.12, vol = 0.3, delay = 0, attack = 0.005 }) {
  const c = ctx();
  if (!c || muted) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise({ dur = 0.15, vol = 0.2, from = 3000, to = 600, delay = 0 }) {
  const c = ctx();
  if (!c || muted) return;
  const t = c.currentTime + delay;
  const len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + dur);
}

const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

export const sfx = {
  correct(combo = 1) {
    const f = SCALE[Math.min(combo - 1, SCALE.length - 1)];
    noise({ dur: 0.08, vol: 0.12, from: 1800, to: 400 });
    tone({ freq: f, type: 'triangle', dur: 0.14, vol: 0.28 });
    tone({ freq: f * 1.5, type: 'sine', dur: 0.18, vol: 0.14, delay: 0.05 });
  },
  wrong() {
    tone({ freq: 180, to: 90, type: 'sawtooth', dur: 0.28, vol: 0.18 });
    tone({ freq: 120, to: 70, type: 'square', dur: 0.22, vol: 0.08, delay: 0.03 });
  },
  whoosh() {
    noise({ dur: 0.14, vol: 0.1, from: 900, to: 3200 });
  },
  combo() {
    [0, 0.07, 0.14].forEach((d, i) => tone({ freq: 880 * (1 + i * 0.25), type: 'triangle', dur: 0.12, vol: 0.2, delay: d }));
  },
  levelUp() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.2, vol: 0.24, delay: i * 0.09 }));
    tone({ freq: 1567.98, type: 'sine', dur: 0.5, vol: 0.12, delay: 0.36 });
  },
  tick() {
    tone({ freq: 1400, type: 'square', dur: 0.04, vol: 0.06 });
  },
  gameOver() {
    [659.25, 523.25, 392, 329.63].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.24, vol: 0.2, delay: i * 0.12 }));
  },
  coin(delay = 0) {
    tone({ freq: 1318.51, type: 'square', dur: 0.06, vol: 0.08, delay });
    tone({ freq: 1975.53, type: 'square', dur: 0.12, vol: 0.08, delay: delay + 0.06 });
  },
  star(i = 0) {
    tone({ freq: 783.99 * (1 + i * 0.26), type: 'triangle', dur: 0.25, vol: 0.22 });
  },
};

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* storage unavailable */ }
  return muted;
}
