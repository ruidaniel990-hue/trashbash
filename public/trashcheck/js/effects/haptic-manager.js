// ── Haptic Manager ──
// Vibration feedback on supporting phones (no-op elsewhere).

const PATTERNS = {
  light: [12],
  heavy: [45],
  double: [15, 50, 15],
  long: [70],
};

export function vibrate(pattern = 'light') {
  if (!navigator.vibrate) return;
  try {
    navigator.vibrate(PATTERNS[pattern] || PATTERNS.light);
  } catch {
    // Some embedded browsers throw instead of ignoring the call.
  }
}
