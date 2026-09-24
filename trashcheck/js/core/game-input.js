// ── Game Input ──
// Unified touch + mouse swipe handler.

import { state } from '../state/game-state.js';
import { CONFIG } from './game-config.js';

let onSortCallback = null;

export function setupInput(zone, onSort) {
  onSortCallback = onSort;

  // Touch events
  zone.addEventListener('touchstart', handleTouchStart, { passive: true });
  zone.addEventListener('touchmove', handleTouchMove, { passive: true });
  zone.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Mouse events (desktop)
  zone.addEventListener('mousedown', handleMouseDown);
  zone.addEventListener('mousemove', handleMouseMove);
  zone.addEventListener('mouseup', handleMouseUp);

  // Keyboard (desktop): arrows map to left / center / right bin
  document.addEventListener('keydown', handleKeyDown);
}

const KEY_TO_BIN = { ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2 };

function handleKeyDown(e) {
  const bin = KEY_TO_BIN[e.key];
  if (bin === undefined || e.repeat) return;
  if (!state.gameActive || state.paused || !state.currentItem) return;
  e.preventDefault();
  onSortCallback?.(bin);
}

// ── Touch handlers ──

function handleTouchStart(e) {
  if (!state.gameActive || !state.currentItem) return;
  state.swipeStartX = e.touches[0].clientX;
  state.swipeStartY = e.touches[0].clientY;
  state.swiping = true;
}

function handleTouchMove(e) {
  if (!state.swiping || !state.itemEl) return;
  const dx = e.touches[0].clientX - state.swipeStartX;
  const dy = e.touches[0].clientY - state.swipeStartY;
  moveItemWithSwipe(dx, dy);
  updateHints(dx, dy);
  highlightTargetBin(dx, dy);
}

function handleTouchEnd(e) {
  if (!state.swiping) return;
  state.swiping = false;
  clearHighlights();

  const dx = e.changedTouches[0].clientX - state.swipeStartX;
  const dy = e.changedTouches[0].clientY - state.swipeStartY;
  resolveSwipe(dx, dy);
}

// ── Mouse handlers ──

function handleMouseDown(e) {
  if (!state.gameActive || !state.currentItem) return;
  state.swipeStartX = e.clientX;
  state.swipeStartY = e.clientY;
  state.swiping = true;
}

function handleMouseMove(e) {
  if (!state.swiping || !state.itemEl) return;
  const dx = e.clientX - state.swipeStartX;
  const dy = e.clientY - state.swipeStartY;
  moveItemWithSwipe(dx, dy);
  updateHints(dx, dy);
  highlightTargetBin(dx, dy);
}

function handleMouseUp(e) {
  if (!state.swiping) return;
  state.swiping = false;
  clearHighlights();

  const dx = e.clientX - state.swipeStartX;
  const dy = e.clientY - state.swipeStartY;
  resolveSwipe(dx, dy);
}

// ── Shared logic ──

function moveItemWithSwipe(dx, dy) {
  if (!state.itemEl) return;
  // Item follows finger 1:1 in pixels and tilts toward the swipe direction
  state.itemEl.style.transition = 'none';
  state.itemEl.style.transform = `translateX(${dx}px) rotate(${Math.max(-18, Math.min(18, dx * 0.08))}deg)`;

  // Vertical movement for downward swipe
  if (dy > 30 && Math.abs(dx) < CONFIG.SWIPE_THRESHOLD) {
    const yOffset = Math.min(18 + (dy / window.innerHeight) * 40, 50);
    state.itemEl.style.top = yOffset + '%';
  }
}

function updateHints(dx, dy) {
  const hintLeft = document.getElementById('hint-left');
  const hintRight = document.getElementById('hint-right');
  if (hintLeft) hintLeft.classList.toggle('show', dx < -30);
  if (hintRight) hintRight.classList.toggle('show', dx > 30);
}

function highlightTargetBin(dx, dy) {
  document.querySelectorAll('.bin').forEach(b => b.classList.remove('highlight'));
  if (dx < -CONFIG.SWIPE_THRESHOLD) {
    document.getElementById('bin-0')?.classList.add('highlight');
  } else if (dx > CONFIG.SWIPE_THRESHOLD) {
    document.getElementById('bin-2')?.classList.add('highlight');
  } else if (dy > CONFIG.SWIPE_THRESHOLD) {
    document.getElementById('bin-1')?.classList.add('highlight');
  }
}

function clearHighlights() {
  document.querySelectorAll('.bin').forEach(b => b.classList.remove('highlight'));
  const hintLeft = document.getElementById('hint-left');
  const hintRight = document.getElementById('hint-right');
  if (hintLeft) hintLeft.classList.remove('show');
  if (hintRight) hintRight.classList.remove('show');
}

function resolveSwipe(dx, dy) {
  if (!onSortCallback) return;
  if (dx < -CONFIG.SWIPE_THRESHOLD) {
    onSortCallback(0); // left bin
  } else if (dx > CONFIG.SWIPE_THRESHOLD) {
    onSortCallback(2); // right bin
  } else if (dy > CONFIG.SWIPE_THRESHOLD) {
    onSortCallback(1); // down swipe = center bin
  }
  else if (state.itemEl) {
    // No clear swipe: spring back, let the fall timer handle it
    state.itemEl.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
    state.itemEl.style.transform = '';
  }
}
