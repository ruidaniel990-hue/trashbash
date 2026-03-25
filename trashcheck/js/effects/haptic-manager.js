// ── Haptic Manager [P3] ──
// Vibration API for mobile feedback.

export function vibrate(pattern = 'light') {
  // TODO [P3]: Trigger haptic feedback
  // Patterns: 'light' (correct), 'heavy' (wrong), 'double' (combo), 'long' (levelup)
  if (!navigator.vibrate) return;

  const patterns = {
    light: [15],
    heavy: [40],
    double: [15, 50, 15],
    long: [80],
  };

  navigator.vibrate(patterns[pattern] || patterns.light);
}
