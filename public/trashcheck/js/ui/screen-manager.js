// ── Screen Manager ──
// Handles screen transitions and navigation history.

const history = [];

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.remove('hidden');
    history.push(id);
  }
}

export function getCurrentScreen() {
  return history.length > 0 ? history[history.length - 1] : null;
}

export function goBack() {
  if (history.length > 1) {
    history.pop();
    showScreen(history.pop()); // pop and re-push via showScreen
  }
}
