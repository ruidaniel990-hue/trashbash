// ── Audio Manager ──
// Sound effects, background music, and DJ scratch effect.

let muted = false;
let audioCtx = null;
let musicSource = null;
let musicGain = null;
let musicBuffer = null;
let musicPlaying = false;

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
  if (musicSource) {
    try { musicSource.stop(); } catch (e) {}
    musicSource = null;
  }
  musicPlaying = false;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

// ── DJ Scratch Effect ──
// Synthetic vinyl-stop sound: noise burst with falling pitch + wobble
// Works standalone (no music needed)
export function playScratchEffect() {
  if (muted) return;

  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const duration = 1.2;
  const now = ctx.currentTime;

  // Master gain for the scratch
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.35, now);
  master.gain.linearRampToValueAtTime(0.0, now + duration);
  master.connect(ctx.destination);

  // Layer 1: Filtered noise (vinyl crackle/hiss)
  const noiseLen = ctx.sampleRate * duration;
  const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.6;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseBP = ctx.createBiquadFilter();
  noiseBP.type = 'bandpass';
  noiseBP.frequency.setValueAtTime(3000, now);
  noiseBP.frequency.exponentialRampToValueAtTime(200, now + duration);
  noiseBP.Q.value = 2;

  noise.connect(noiseBP);
  noiseBP.connect(master);
  noise.start(now);
  noise.stop(now + duration);

  // Layer 2: Pitch-dropping tone (the "wooooow" slowdown)
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + duration);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.15, now);
  oscGain.gain.linearRampToValueAtTime(0.0, now + duration * 0.8);

  const oscFilter = ctx.createBiquadFilter();
  oscFilter.type = 'lowpass';
  oscFilter.frequency.setValueAtTime(2000, now);
  oscFilter.frequency.exponentialRampToValueAtTime(100, now + duration);

  osc.connect(oscFilter);
  oscFilter.connect(oscGain);
  oscGain.connect(master);
  osc.start(now);
  osc.stop(now + duration);

  // Layer 3: Low thump (vinyl motor stopping)
  const thump = ctx.createOscillator();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(80, now);
  thump.frequency.exponentialRampToValueAtTime(20, now + duration);

  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.2, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  thump.connect(thumpGain);
  thumpGain.connect(master);
  thump.start(now);
  thump.stop(now + duration);
}
