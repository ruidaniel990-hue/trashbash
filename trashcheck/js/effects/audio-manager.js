// ── Audio Manager [P3] ──
// Sound effects and background music.

let muted = false;

export function playSound(name) {
  // TODO [P3]: Play sound effect
  // Sounds: 'correct', 'wrong', 'combo', 'levelup', 'gameover', 'button'
  if (muted) return;
}

export function playMusic(track) {
  // TODO [P3]: Start background music loop
}

export function stopMusic() {
  // TODO [P3]: Stop background music
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
