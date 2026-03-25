// ── Audio Manager ──
// Sound effects, background music, and DJ scratch effect.

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

// ── DJ Scratch Effect ──
// Synthetic vinyl-stop: 0.7s, hard cutoff, fully self-cleaning
export function playScratchEffect() {
  if (muted) return;

  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const dur = 0.7;
  const now = ctx.currentTime;
  const end = now + dur;

  // Master gain — fades to silence
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.4, now);
  master.gain.linearRampToValueAtTime(0.0, end);
  master.connect(ctx.destination);

  // Layer 1: Noise burst (vinyl crackle)
  const noiseLen = Math.ceil(ctx.sampleRate * dur);
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) nd[i] = (Math.random() * 2 - 1) * 0.5;

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(2500, now);
  bp.frequency.linearRampToValueAtTime(200, end);
  bp.Q.value = 1.5;

  noise.connect(bp);
  bp.connect(master);
  noise.start(now);
  noise.stop(end);

  // Layer 2: Pitch-drop tone ("wooow" slowdown)
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(350, now);
  osc.frequency.linearRampToValueAtTime(30, end);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.12, now);
  oscGain.gain.linearRampToValueAtTime(0.0, now + dur * 0.7);

  osc.connect(oscGain);
  oscGain.connect(master);
  osc.start(now);
  osc.stop(end);

  // Layer 3: Sub thump
  const thump = ctx.createOscillator();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(70, now);
  thump.frequency.linearRampToValueAtTime(20, end);

  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.18, now);
  thumpGain.gain.linearRampToValueAtTime(0.0, end);

  thump.connect(thumpGain);
  thumpGain.connect(master);
  thump.start(now);
  thump.stop(end);

  // Hard disconnect after effect ends — ensures zero residual sound
  setTimeout(() => {
    master.disconnect();
  }, dur * 1000 + 50);
}
