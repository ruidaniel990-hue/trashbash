// ── Icons ──
// Replaces emoji with bundled Twemoji SVGs so icons look identical on every device.
// Emoji without a bundled SVG stay as native text.

import { ICON_CODES } from './icon-manifest.js';

const BASE = new URL('../../assets/icons/', import.meta.url).href;
const AVAILABLE = new Set(ICON_CODES);
const EMOJI_RE = /\p{Extended_Pictographic}️?/gu;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT']);

function codeOf(emoji) {
  return [...emoji]
    .map(c => c.codePointAt(0).toString(16))
    .filter(h => h !== 'fe0f')
    .join('-');
}

export function iconUrl(emoji) {
  const code = codeOf(emoji);
  return AVAILABLE.has(code) ? BASE + code + '.svg' : null;
}

export function iconHtml(emoji, cls = 'ic') {
  const url = iconUrl(emoji);
  if (!url) return `<span class="${cls} ic-text">${emoji}</span>`;
  return `<img class="${cls}" src="${url}" alt="${emoji}" draggable="false">`;
}

function replaceInTextNode(node) {
  const text = node.nodeValue;
  EMOJI_RE.lastIndex = 0;
  if (!EMOJI_RE.test(text)) return;
  EMOJI_RE.lastIndex = 0;

  const frag = document.createDocumentFragment();
  let last = 0;
  let replaced = false;
  for (const m of text.matchAll(EMOJI_RE)) {
    const url = iconUrl(m[0]);
    if (!url) continue;
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    const img = document.createElement('img');
    img.className = 'ic';
    img.src = url;
    img.alt = m[0];
    img.draggable = false;
    frag.appendChild(img);
    last = m.index + m[0].length;
    replaced = true;
  }
  if (!replaced) return;
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  node.parentNode.replaceChild(frag, node);
}

export function iconize(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    if (root.parentNode && !SKIP_TAGS.has(root.parentNode.nodeName)) replaceInTextNode(root);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE || SKIP_TAGS.has(root.nodeName)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => SKIP_TAGS.has(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(replaceInTextNode);
}

// Keeps dynamically inserted text (HUD, shop, results) iconized.
export function watchIcons(root = document.body) {
  iconize(root);
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'characterData') iconize(m.target);
      else m.addedNodes.forEach(iconize);
    }
  });
  observer.observe(root, { childList: true, subtree: true, characterData: true });
}
