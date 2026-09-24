// ── Daily Task ──
// One task per calendar day (same for every player on that date), progress stored locally.

const KEY = 'tc_daily';

const TASKS = [
  { kind: 'category', key: 'bio',    target: 15, reward: 60, icon: '🌱', text: 'Sortiere 15× Biomüll richtig' },
  { kind: 'category', key: 'gelb',   target: 15, reward: 60, icon: '♻️', text: 'Sortiere 15× in die Gelbe Tonne' },
  { kind: 'category', key: 'papier', target: 12, reward: 50, icon: '📦', text: 'Sortiere 12× Papier richtig' },
  { kind: 'category', key: 'rest',   target: 12, reward: 50, icon: '🗑️', text: 'Sortiere 12× Restmüll richtig' },
  { kind: 'combo',  target: 8,   reward: 70, icon: '🔥', text: 'Erreiche eine Combo von ×8' },
  { kind: 'score',  target: 500, reward: 80, icon: '🏆', text: 'Hol 500 Punkte in einer Runde' },
  { kind: 'level',  target: 3,   reward: 70, icon: '🗺️', text: 'Erreiche Level 3' },
  { kind: 'golden', target: 3,   reward: 70, icon: '✨', text: 'Fang 3× goldenen Müll' },
];

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function hash(str) {
  let h = 7;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function todaysTask() {
  return TASKS[hash(today()) % TASKS.length];
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && saved.date === today()) return saved;
  } catch { /* storage unavailable */ }
  return { date: today(), progress: 0, done: false };
}

function save(entry) {
  try { localStorage.setItem(KEY, JSON.stringify(entry)); } catch { /* storage unavailable */ }
}

export function getDailyTask() {
  const task = todaysTask();
  const entry = load();
  return { ...task, progress: Math.min(entry.progress, task.target), done: entry.done };
}

// Events: { type: 'correct', bin } | { type: 'golden' } | { type: 'combo' | 'score' | 'level', value }
// Returns the reward when this event completes the task, otherwise 0.
export function trackDaily(event) {
  const task = todaysTask();
  const entry = load();
  if (entry.done) return 0;

  if (task.kind === 'category' && event.type === 'correct' && event.bin === task.key) entry.progress++;
  else if (task.kind === 'golden' && event.type === 'golden') entry.progress++;
  else if (task.kind === event.type && typeof event.value === 'number') entry.progress = Math.max(entry.progress, event.value);
  else return 0;

  if (entry.progress >= task.target) {
    entry.done = true;
    save(entry);
    return task.reward;
  }
  save(entry);
  return 0;
}
