// ── Audio Manager ──
// Sound effects and background music.

let muted = false;
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// ── Sound Effects ──
export function playSound(name) {
  if (muted) return;
  // TODO: implement per-sound playback
}

// ── Music ──
export function playMusic(track) {
  // TODO: implement background music
}

export function stopMusic() {
  // TODO: implement stop
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
