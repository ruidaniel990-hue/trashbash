/* ============================================================
   avatar-renderer.js  –  Trash Bash Avatar System v2
   Modern, detailed character rendering.
   Plain JS globals, no ES modules.
   ============================================================ */

// ── Item Catalogue ──────────────────────────────────────────
window.AVATAR_ITEMS = {
  skins: [
    { id:'skin_warm',   name:'Warm',    color:'#f5c6a0', price:0   },
    { id:'skin_light',  name:'Hell',    color:'#fddbb4', price:0   },
    { id:'skin_medium', name:'Mittel',  color:'#c68642', price:50  },
    { id:'skin_dark',   name:'Dunkel',  color:'#8d5524', price:50  },
    { id:'skin_green',  name:'Eco',     color:'#5aad6e', price:150 },
  ],
  hats: [
    { id:'hat_none',    name:'Kein Hut',  icon:'—',  price:0   },
    { id:'hat_cap',     name:'Cap',        icon:'🧢', price:50  },
    { id:'hat_hardhat', name:'Helm',       icon:'⛑️', price:80  },
    { id:'hat_tophat',  name:'Zylinder',  icon:'🎩', price:100 },
    { id:'hat_cowboy',  name:'Cowboy',    icon:'🤠', price:120 },
    { id:'hat_crown',   name:'Krone',     icon:'👑', price:300 },
  ],
  shirts: [
    { id:'shirt_default', name:'Blau',        icon:'👕', price:0,   color:'#2563eb' },
    { id:'shirt_red',     name:'Rot',          icon:'👕', price:60,  color:'#dc2626' },
    { id:'shirt_eco',     name:'Eco Weste',   icon:'🦺', price:75,  color:'#16a34a' },
    { id:'shirt_lab',     name:'Lab Coat',    icon:'🥼', price:100, color:'#e2e8f0' },
    { id:'shirt_orange',  name:'Winterjacke', icon:'🧥', price:150, color:'#ea580c' },
  ],
  pants: [
    { id:'pants_default', name:'Dunkelblau', icon:'👖', price:0,  color:'#1e3a8a' },
    { id:'pants_grey',    name:'Grau',       icon:'👖', price:50, color:'#6b7280' },
    { id:'pants_cargo',   name:'Cargo',      icon:'🩳', price:60, color:'#4a5e3a' },
    { id:'pants_black',   name:'Schwarz',    icon:'👖', price:70, color:'#111827' },
  ],
  shoes: [
    { id:'shoes_default', name:'Schwarz',      icon:'👟', price:0,   color:'#1f2937' },
    { id:'shoes_white',   name:'Sneakers',     icon:'👟', price:60,  color:'#f1f5f9' },
    { id:'shoes_boots',   name:'Stiefel',      icon:'🥾', price:80,  color:'#78350f' },
    { id:'shoes_yellow',  name:'Gummistiefel', icon:'🌧️', price:100, color:'#fbbf24' },
  ],
  accessories: [
    { id:'acc_none',       name:'Nichts',        icon:'—',  price:0   },
    { id:'acc_gloves',     name:'Handschuhe',    icon:'🧤', price:40  },
    { id:'acc_flashlight', name:'Taschenlampe',  icon:'🔦', price:60  },
    { id:'acc_backpack',   name:'Rucksack',      icon:'🎒', price:100 },
  ],
};

// ── Storage Helpers ──────────────────────────────────────────
var _DEFAULT_EQUIPPED = {
  skin:'skin_warm', hat:'hat_none', shirt:'shirt_default',
  pants:'pants_default', shoes:'shoes_default', accessory:'acc_none'
};
var _DEFAULT_OWNED = [
  'skin_warm','skin_light','hat_none','shirt_default',
  'pants_default','shoes_default','acc_none'
];

window.AvatarStore = {
  getEquipped: function() {
    try {
      var v = localStorage.getItem('tb_equipped');
      return v ? JSON.parse(v) : Object.assign({}, _DEFAULT_EQUIPPED);
    } catch(e) { return Object.assign({}, _DEFAULT_EQUIPPED); }
  },
  setEquipped: function(eq) {
    localStorage.setItem('tb_equipped', JSON.stringify(eq));
  },
  getCoins: function() {
    return parseInt(localStorage.getItem('tb_coins') || '2250', 10);
  },
  setCoins: function(c) {
    localStorage.setItem('tb_coins', String(c));
  },
  getOwned: function() {
    try {
      var v = localStorage.getItem('tb_owned');
      return v ? JSON.parse(v) : _DEFAULT_OWNED.slice();
    } catch(e) { return _DEFAULT_OWNED.slice(); }
  },
  addOwned: function(id) {
    var o = window.AvatarStore.getOwned();
    if (!o.includes(id)) {
      o.push(id);
      localStorage.setItem('tb_owned', JSON.stringify(o));
    }
  }
};

// ── Lookup helpers ───────────────────────────────────────────
function _findItem(category, id) {
  var list = window.AVATAR_ITEMS[category];
  if (!list) return null;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return list[0];
}

function _skinColor(equipped) {
  var item = _findItem('skins', equipped.skin);
  return item ? item.color : '#f5c6a0';
}
function _shirtColor(equipped) {
  var item = _findItem('shirts', equipped.shirt);
  return item ? (item.color || '#2563eb') : '#2563eb';
}
function _pantsColor(equipped) {
  var item = _findItem('pants', equipped.pants);
  return item ? (item.color || '#1e3a8a') : '#1e3a8a';
}
function _shoesColor(equipped) {
  var item = _findItem('shoes', equipped.shoes);
  return item ? (item.color || '#1f2937') : '#1f2937';
}

function _darken(hex, amount) {
  amount = amount || 30;
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  return '#' + [r,g,b].map(function(x){ return ('0'+x.toString(16)).slice(-2); }).join('');
}

function _lighten(hex, amount) {
  amount = amount || 30;
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return '#' + [r,g,b].map(function(x){ return ('0'+x.toString(16)).slice(-2); }).join('');
}

// ── SVG Renderer v2 ─────────────────────────────────────────
window.renderAvatarSVG = function(equipped) {
  equipped = equipped || window.AvatarStore.getEquipped();

  var skin    = _skinColor(equipped);
  var skinD   = _darken(skin, 20);
  var skinL   = _lighten(skin, 20);
  var skinDD  = _darken(skin, 40);
  var shirt   = _shirtColor(equipped);
  var shirtD  = _darken(shirt, 25);
  var shirtL  = _lighten(shirt, 15);
  var pants   = _pantsColor(equipped);
  var pantsD  = _darken(pants, 25);
  var shoes   = _shoesColor(equipped);
  var shoesD  = _darken(shoes, 25);
  var shoesL  = _lighten(shoes, 20);

  var hat       = equipped.hat       || 'hat_none';
  var accessory = equipped.accessory || 'acc_none';

  // Unique ID suffix for gradient isolation
  var uid = Math.random().toString(36).substring(2, 7);

  // ── Defs (gradients & filters) ──
  var defs = '<defs>' +
    // Skin gradient
    '<radialGradient id="skinG_' + uid + '" cx="45%" cy="35%" r="55%">' +
      '<stop offset="0%" stop-color="' + skinL + '"/>' +
      '<stop offset="100%" stop-color="' + skin + '"/>' +
    '</radialGradient>' +
    // Shirt gradient
    '<linearGradient id="shirtG_' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + shirtL + '"/>' +
      '<stop offset="100%" stop-color="' + shirtD + '"/>' +
    '</linearGradient>' +
    // Pants gradient
    '<linearGradient id="pantsG_' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + pants + '"/>' +
      '<stop offset="100%" stop-color="' + pantsD + '"/>' +
    '</linearGradient>' +
    // Shoe gradient
    '<linearGradient id="shoeG_' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + shoesL + '"/>' +
      '<stop offset="100%" stop-color="' + shoesD + '"/>' +
    '</linearGradient>' +
    // Eye white gradient
    '<radialGradient id="eyeW_' + uid + '" cx="50%" cy="40%" r="50%">' +
      '<stop offset="0%" stop-color="#ffffff"/>' +
      '<stop offset="100%" stop-color="#e8edf2"/>' +
    '</radialGradient>' +
    // Hair gradient
    '<linearGradient id="hairG_' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#5a3a1a"/>' +
      '<stop offset="100%" stop-color="#2d1a08"/>' +
    '</linearGradient>' +
    // Soft drop shadow
    '<filter id="shd_' + uid + '" x="-15%" y="-10%" width="130%" height="130%">' +
      '<feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.3)"/>' +
    '</filter>' +
    // Inner glow for face
    '<filter id="fGlow_' + uid + '">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>' +
      '<feFlood flood-color="' + skinL + '" flood-opacity="0.3"/>' +
      '<feComposite in2="blur" operator="in"/>' +
      '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
    '</filter>' +
  '</defs>';

  var parts = [];

  // ── Backpack (behind body) ──
  if (accessory === 'acc_backpack') {
    parts.push(
      '<rect x="63" y="63" width="15" height="24" rx="4" fill="#6b3a10" stroke="#4a2508" stroke-width="0.8"/>',
      '<rect x="64.5" y="65" width="12" height="9" rx="3" fill="#8b5023"/>',
      '<rect x="66" y="76" width="5" height="8" rx="2" fill="#8b5023"/>',
      '<path d="M63 66 L58 72" stroke="#4a2508" stroke-width="2.5" stroke-linecap="round"/>',
      '<path d="M63 82 L58 86" stroke="#4a2508" stroke-width="2.5" stroke-linecap="round"/>'
    );
  }

  // ── Shoes ──
  parts.push(
    // Left shoe - more 3D shape
    '<path d="M26 138 Q26 132 32 131 L44 131 Q48 131 48 136 L48 142 Q48 146 40 147 L30 147 Q26 147 26 142 Z" fill="url(#shoeG_' + uid + ')" stroke="' + shoesD + '" stroke-width="0.8"/>',
    '<path d="M28 136 L46 136" stroke="' + shoesL + '" stroke-width="0.8" opacity="0.5"/>',
    // Right shoe
    '<path d="M52 138 Q52 132 58 131 L70 131 Q74 131 74 136 L74 142 Q74 146 66 147 L56 147 Q52 147 52 142 Z" fill="url(#shoeG_' + uid + ')" stroke="' + shoesD + '" stroke-width="0.8"/>',
    '<path d="M54 136 L72 136" stroke="' + shoesL + '" stroke-width="0.8" opacity="0.5"/>'
  );

  // ── Pants / Legs ──
  parts.push(
    // Left leg
    '<path d="M30 106 Q28 106 28 110 L28 132 Q28 134 32 134 L46 134 Q48 134 48 132 L48 110 Q48 106 46 106 Z" fill="url(#pantsG_' + uid + ')"/>',
    // Right leg
    '<path d="M52 106 Q50 106 50 110 L50 132 Q50 134 54 134 L68 134 Q72 134 72 132 L72 110 Q72 106 70 106 Z" fill="url(#pantsG_' + uid + ')"/>',
    // Waistband
    '<rect x="28" y="104" width="44" height="6" rx="2" fill="' + pantsD + '"/>',
    '<rect x="28" y="104" width="44" height="2.5" rx="1" fill="' + pants + '" opacity="0.6"/>',
    // Belt
    '<rect x="28" y="104" width="44" height="4" rx="1.5" fill="' + _darken(pants, 35) + '"/>',
    '<rect x="46" y="104" width="8" height="4" rx="1" fill="#9ca3af"/>',
    // Seam lines
    '<line x1="38" y1="110" x2="38" y2="132" stroke="' + pantsD + '" stroke-width="0.6" opacity="0.4"/>',
    '<line x1="60" y1="110" x2="60" y2="132" stroke="' + pantsD + '" stroke-width="0.6" opacity="0.4"/>',
    // Knee highlights
    '<ellipse cx="38" cy="122" rx="6" ry="3" fill="' + _lighten(pants, 10) + '" opacity="0.2"/>'
  );

  // ── Shirt / Torso ──
  parts.push(
    // Main torso
    '<path d="M26 72 Q26 68 30 68 L70 68 Q74 68 74 72 L74 108 Q74 112 70 112 L30 112 Q26 112 26 108 Z" fill="url(#shirtG_' + uid + ')"/>',
    // Collar
    '<path d="M38 68 L50 78 L62 68" fill="none" stroke="' + shirtD + '" stroke-width="2" stroke-linejoin="round"/>',
    '<path d="M39 68 L50 76 L61 68" fill="' + _darken(shirt, 15) + '"/>',
    // Shirt fold lines
    '<path d="M35 80 Q38 88 36 95" stroke="' + shirtD + '" stroke-width="0.8" fill="none" opacity="0.4"/>',
    '<path d="M65 80 Q62 88 64 95" stroke="' + shirtD + '" stroke-width="0.8" fill="none" opacity="0.4"/>',
    // Bottom hem
    '<path d="M26 108 L74 108" stroke="' + shirtD + '" stroke-width="1.2" opacity="0.5"/>',
    // Shoulder seams
    '<path d="M26 72 Q32 70 38 72" stroke="' + shirtD + '" stroke-width="0.7" fill="none" opacity="0.3"/>',
    '<path d="M74 72 Q68 70 62 72" stroke="' + shirtD + '" stroke-width="0.7" fill="none" opacity="0.3"/>'
  );

  // ── Arms ──
  parts.push(
    // Left arm (sleeve + arm)
    '<path d="M14 74 Q12 74 12 78 L12 96 Q12 100 16 100 L24 100 Q28 100 28 96 L28 78 Q28 74 26 74 Z" fill="url(#shirtG_' + uid + ')"/>',
    '<path d="M14 74 L26 74" stroke="' + shirtD + '" stroke-width="0.7" opacity="0.3"/>',
    // Left forearm (skin)
    '<path d="M14 98 Q12 98 13 104 L15 112 Q17 116 20 116 Q23 116 25 112 L27 104 Q28 98 26 98 Z" fill="url(#skinG_' + uid + ')"/>',
    // Left hand
    '<ellipse cx="20" cy="118" rx="7.5" ry="6.5" fill="url(#skinG_' + uid + ')" stroke="' + skinD + '" stroke-width="0.8"/>',
    '<path d="M15 116 Q14 113 15 111" stroke="' + skinD + '" stroke-width="0.7" fill="none" opacity="0.3"/>',

    // Right arm (sleeve + arm)
    '<path d="M72 74 Q70 74 70 78 L70 96 Q70 100 74 100 L82 100 Q86 100 86 96 L86 78 Q86 74 84 74 Z" fill="url(#shirtG_' + uid + ')"/>',
    '<path d="M72 74 L84 74" stroke="' + shirtD + '" stroke-width="0.7" opacity="0.3"/>',
    // Right forearm
    '<path d="M72 98 Q70 98 71 104 L73 112 Q75 116 78 116 Q81 116 83 112 L85 104 Q86 98 84 98 Z" fill="url(#skinG_' + uid + ')"/>',
    // Right hand
    '<ellipse cx="78" cy="118" rx="7.5" ry="6.5" fill="url(#skinG_' + uid + ')" stroke="' + skinD + '" stroke-width="0.8"/>',
    '<path d="M83 116 Q84 113 83 111" stroke="' + skinD + '" stroke-width="0.7" fill="none" opacity="0.3"/>'
  );

  // ── Flashlight ──
  if (accessory === 'acc_flashlight') {
    parts.push(
      '<rect x="9" y="110" width="9" height="16" rx="3" fill="#374151" stroke="#1f2937" stroke-width="0.8"/>',
      '<rect x="7.5" y="107" width="12" height="6" rx="3" fill="#6b7280" stroke="#4b5563" stroke-width="0.8"/>',
      '<polygon points="8,107 2,99 15,99" fill="rgba(255,230,120,0.4)"/>',
      '<ellipse cx="8.5" cy="101" rx="5" ry="3.5" fill="rgba(255,230,120,0.2)"/>'
    );
  }

  // ── Gloves ──
  if (accessory === 'acc_gloves') {
    parts.push(
      '<ellipse cx="20" cy="118" rx="8.5" ry="7.5" fill="#2d3748" stroke="#1a202c" stroke-width="1"/>',
      '<path d="M14.5 114 L13 110" stroke="#4a5568" stroke-width="2" stroke-linecap="round"/>',
      '<path d="M20 113 L20 109" stroke="#4a5568" stroke-width="2" stroke-linecap="round"/>',
      '<path d="M25.5 114 L27 110" stroke="#4a5568" stroke-width="2" stroke-linecap="round"/>',
      '<ellipse cx="78" cy="118" rx="8.5" ry="7.5" fill="#2d3748" stroke="#1a202c" stroke-width="1"/>',
      '<path d="M72.5 114 L71 110" stroke="#4a5568" stroke-width="2" stroke-linecap="round"/>',
      '<path d="M78 113 L78 109" stroke="#4a5568" stroke-width="2" stroke-linecap="round"/>',
      '<path d="M83.5 114 L85 110" stroke="#4a5568" stroke-width="2" stroke-linecap="round"/>'
    );
  }

  // ── Neck ──
  parts.push(
    '<rect x="42" y="56" width="16" height="16" rx="5" fill="url(#skinG_' + uid + ')"/>',
    '<rect x="42" y="56" width="16" height="7" rx="5" fill="' + skinD + '" opacity="0.15"/>'
  );

  // ── Head ──
  parts.push(
    // Head shape (slightly more oval)
    '<ellipse cx="50" cy="40" rx="24" ry="23" fill="url(#skinG_' + uid + ')" filter="url(#fGlow_' + uid + ')"/>',

    // Ears with more detail
    '<ellipse cx="26" cy="42" rx="5" ry="6" fill="url(#skinG_' + uid + ')" stroke="' + skinD + '" stroke-width="0.8"/>',
    '<ellipse cx="26" cy="42" rx="2.5" ry="3.5" fill="' + skinD + '" opacity="0.25"/>',
    '<ellipse cx="74" cy="42" rx="5" ry="6" fill="url(#skinG_' + uid + ')" stroke="' + skinD + '" stroke-width="0.8"/>',
    '<ellipse cx="74" cy="42" rx="2.5" ry="3.5" fill="' + skinD + '" opacity="0.25"/>',

    // Hair - layered and more realistic
    '<path d="M26 32 Q26 12 50 10 Q74 12 74 32 L74 26 Q74 8 50 5 Q26 8 26 26 Z" fill="url(#hairG_' + uid + ')"/>',
    // Hair volume on top
    '<ellipse cx="50" cy="14" rx="22" ry="10" fill="url(#hairG_' + uid + ')"/>',
    // Hair side strands
    '<path d="M28 20 Q26 28 27 34" stroke="#3d2010" stroke-width="2.5" fill="none" opacity="0.5"/>',
    '<path d="M72 20 Q74 28 73 34" stroke="#3d2010" stroke-width="2.5" fill="none" opacity="0.5"/>',
    // Hair highlights
    '<path d="M36 12 Q42 8 50 9" stroke="#7a5230" stroke-width="1.5" fill="none" opacity="0.4"/>',
    '<path d="M42 10 Q48 7 56 9" stroke="#7a5230" stroke-width="1" fill="none" opacity="0.3"/>',
    // Hair parting
    '<path d="M44 8 Q46 14 44 20" stroke="#231005" stroke-width="0.8" fill="none" opacity="0.4"/>',

    // Eyebrows - more expressive
    '<path d="M36 31 Q40 28 44 31" stroke="#3b2006" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    '<path d="M56 31 Q60 28 64 31" stroke="#3b2006" stroke-width="2.2" fill="none" stroke-linecap="round"/>',

    // Eyes - larger, more detailed
    // Left eye
    '<ellipse cx="40" cy="38" rx="6" ry="6.5" fill="url(#eyeW_' + uid + ')" stroke="' + skinDD + '" stroke-width="0.5"/>',
    // Upper eyelid shadow
    '<path d="M34 36 Q40 33 46 36" fill="' + skinD + '" opacity="0.15"/>',
    // Iris with gradient
    '<circle cx="40" cy="39" r="4" fill="#1e3a6e"/>',
    '<circle cx="40" cy="39" r="3.8" fill="#2554a0"/>',
    '<circle cx="40" cy="40" r="2.5" fill="#1a3478"/>',
    // Pupil
    '<circle cx="40" cy="39.5" r="1.8" fill="#0a0f1a"/>',
    // Eye shine (two reflections for realism)
    '<circle cx="42" cy="37.5" r="1.5" fill="white" opacity="0.9"/>',
    '<circle cx="38.5" cy="40.5" r="0.8" fill="white" opacity="0.5"/>',
    // Lower eyelid line
    '<path d="M35 41 Q40 43 45 41" stroke="' + skinD + '" stroke-width="0.5" fill="none" opacity="0.3"/>',

    // Right eye
    '<ellipse cx="60" cy="38" rx="6" ry="6.5" fill="url(#eyeW_' + uid + ')" stroke="' + skinDD + '" stroke-width="0.5"/>',
    '<path d="M54 36 Q60 33 66 36" fill="' + skinD + '" opacity="0.15"/>',
    '<circle cx="60" cy="39" r="4" fill="#1e3a6e"/>',
    '<circle cx="60" cy="39" r="3.8" fill="#2554a0"/>',
    '<circle cx="60" cy="40" r="2.5" fill="#1a3478"/>',
    '<circle cx="60" cy="39.5" r="1.8" fill="#0a0f1a"/>',
    '<circle cx="62" cy="37.5" r="1.5" fill="white" opacity="0.9"/>',
    '<circle cx="58.5" cy="40.5" r="0.8" fill="white" opacity="0.5"/>',
    '<path d="M55 41 Q60 43 65 41" stroke="' + skinD + '" stroke-width="0.5" fill="none" opacity="0.3"/>',

    // Eyelashes (subtle)
    '<path d="M34 35 L33 33" stroke="#2d1a08" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>',
    '<path d="M66 35 L67 33" stroke="#2d1a08" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>',

    // Nose - more defined
    '<path d="M48 42 Q50 47 52 42" stroke="' + skinD + '" stroke-width="1.2" fill="none" opacity="0.5"/>',
    '<ellipse cx="48" cy="45" rx="1.2" ry="0.8" fill="' + skinD + '" opacity="0.3"/>',
    '<ellipse cx="52" cy="45" rx="1.2" ry="0.8" fill="' + skinD + '" opacity="0.3"/>',
    // Nose bridge highlight
    '<line x1="50" y1="35" x2="50" y2="42" stroke="' + skinL + '" stroke-width="1" opacity="0.15"/>',

    // Mouth - friendlier, more detailed
    '<path d="M42 50 Q46 55 50 54 Q54 55 58 50" stroke="#c0786a" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
    // Lower lip highlight
    '<path d="M44 52 Q50 56 56 52" fill="#d4897b" opacity="0.3"/>',

    // Rosy cheeks - softer
    '<ellipse cx="33" cy="46" rx="5.5" ry="3" fill="#ffaaaa" opacity="0.25"/>',
    '<ellipse cx="67" cy="46" rx="5.5" ry="3" fill="#ffaaaa" opacity="0.25"/>',

    // Face contour highlight (subtle 3D)
    '<path d="M30 30 Q28 40 30 52" stroke="' + skinL + '" stroke-width="1" fill="none" opacity="0.15"/>',

    // Chin definition
    '<path d="M42 56 Q50 60 58 56" stroke="' + skinD + '" stroke-width="0.8" fill="none" opacity="0.15"/>'
  );

  // ── Hat ──
  if (hat === 'hat_cap') {
    parts.push(
      '<path d="M26 24 Q28 6 50 4 Q72 6 74 24 Z" fill="#dc2626"/>',
      '<linearGradient id="capG_' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#b91c1c"/></linearGradient>',
      '<path d="M26 24 Q28 6 50 4 Q72 6 74 24 Z" fill="url(#capG_' + uid + ')"/>',
      '<ellipse cx="50" cy="24" rx="30" ry="6" fill="#b91c1c"/>',
      '<path d="M20 24 Q35 30 50 29 Q65 30 80 24" fill="#991b1b" opacity="0.6"/>',
      '<line x1="50" y1="5" x2="50" y2="24" stroke="#991b1b" stroke-width="0.8" opacity="0.4"/>',
      '<circle cx="50" cy="5" r="2.5" fill="#7f1d1d"/>',
      '<path d="M28 22 Q50 25 72 22" stroke="#7f1d1d" stroke-width="1.5" fill="none"/>'
    );
  } else if (hat === 'hat_hardhat') {
    parts.push(
      '<path d="M22 24 Q22 4 50 2 Q78 4 78 24 Z" fill="#fbbf24"/>',
      '<linearGradient id="hhG_' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#d97706"/></linearGradient>',
      '<path d="M22 24 Q22 4 50 2 Q78 4 78 24 Z" fill="url(#hhG_' + uid + ')"/>',
      '<rect x="18" y="22" width="64" height="7" rx="3" fill="#d97706"/>',
      '<path d="M25 16 Q50 13 75 16" stroke="#b45309" stroke-width="2.5" fill="none"/>',
      '<rect x="30" y="26" width="40" height="2.5" rx="1" fill="#b45309" opacity="0.5"/>'
    );
  } else if (hat === 'hat_tophat') {
    parts.push(
      '<ellipse cx="50" cy="18" rx="30" ry="5.5" fill="#1f2937"/>',
      '<rect x="30" y="-8" width="40" height="28" rx="4" fill="#111827"/>',
      '<linearGradient id="thG_' + uid + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1f2937"/><stop offset="50%" stop-color="#374151"/><stop offset="100%" stop-color="#1f2937"/></linearGradient>',
      '<rect x="30" y="-8" width="40" height="28" rx="4" fill="url(#thG_' + uid + ')"/>',
      '<rect x="30" y="12" width="40" height="4" rx="1" fill="#dc2626"/>',
      '<ellipse cx="50" cy="-8" rx="19" ry="4.5" fill="#1f2937"/>'
    );
  } else if (hat === 'hat_cowboy') {
    parts.push(
      '<ellipse cx="50" cy="18" rx="36" ry="7.5" fill="#92400e"/>',
      '<path d="M24 18 Q28 -4 50 -6 Q72 -4 76 18 Z" fill="#a16207"/>',
      '<ellipse cx="50" cy="-3" rx="15" ry="6" fill="#92400e"/>',
      '<path d="M26 16 Q50 20 74 16" stroke="#6b2d08" stroke-width="3" fill="none"/>',
      '<path d="M14 18 Q24 11 34 16" stroke="#78350f" stroke-width="1.5" fill="none"/>',
      '<path d="M86 18 Q76 11 66 16" stroke="#78350f" stroke-width="1.5" fill="none"/>'
    );
  } else if (hat === 'hat_crown') {
    parts.push(
      '<rect x="25" y="18" width="50" height="12" rx="3" fill="#b45309"/>',
      '<polygon points="25,18 32,4 38,18" fill="#d97706"/>',
      '<polygon points="38,18 44,6 50,18" fill="#d97706"/>',
      '<polygon points="50,18 56,4 62,18" fill="#d97706"/>',
      '<polygon points="62,18 68,6 75,18" fill="#d97706"/>',
      '<circle cx="32" cy="8" r="3" fill="#dc2626"/>',
      '<circle cx="47" cy="10" r="2.5" fill="#0ea5e9"/>',
      '<circle cx="53" cy="10" r="2.5" fill="#10b981"/>',
      '<circle cx="68" cy="8" r="3" fill="#dc2626"/>',
      // Shine on jewels
      '<circle cx="31" cy="7" r="1" fill="white" opacity="0.5"/>',
      '<circle cx="67" cy="7" r="1" fill="white" opacity="0.5"/>',
      '<rect x="25" y="24" width="50" height="6" rx="2" fill="#fbbf24"/>',
      '<rect x="25" y="24" width="50" height="2" rx="1" fill="#fcd34d" opacity="0.5"/>'
    );
  }

  // ── Assemble SVG ──
  // options.animated adds idle breathing/bounce animation
  var animated = (equipped._animated === true);
  var animStyle = '';
  if (animated) {
    animStyle = '<style>' +
      '@keyframes avIdle_' + uid + ' { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }' +
      '@keyframes avArm_' + uid + ' { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-3deg)} 75%{transform:rotate(3deg)} }' +
      '@keyframes avBlink_' + uid + ' { 0%,92%,96%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.1)} }' +
      '.av-body_' + uid + ' { animation: avIdle_' + uid + ' 2.5s ease-in-out infinite; transform-origin: 50px 145px; }' +
      '.av-head_' + uid + ' { animation: avIdle_' + uid + ' 2.5s ease-in-out infinite; animation-delay: -0.15s; transform-origin: 50px 60px; }' +
      '.av-larm_' + uid + ' { animation: avArm_' + uid + ' 3s ease-in-out infinite; transform-origin: 20px 74px; }' +
      '.av-rarm_' + uid + ' { animation: avArm_' + uid + ' 3s ease-in-out infinite; animation-delay: -1.5s; transform-origin: 80px 74px; }' +
      '.av-eyes_' + uid + ' { animation: avBlink_' + uid + ' 4s ease-in-out infinite; transform-origin: 50px 38px; }' +
    '</style>';
  }

  // Split parts into groups for animation
  // For non-animated, just wrap everything
  var svgContent;
  if (animated) {
    // We need to rebuild with grouped parts - use the same parts but wrap in one group
    // The simple approach: wrap entire avatar with idle animation
    svgContent = animStyle +
      '<g filter="url(#shd_' + uid + ')" class="av-body_' + uid + '">' +
      parts.join('') +
      '</g>';
  } else {
    svgContent = '<g filter="url(#shd_' + uid + '">' +
      parts.join('') +
      '</g>';
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 160" width="100" height="160">' +
    defs +
    (animated ? animStyle : '') +
    '<g filter="url(#shd_' + uid + ')"' + (animated ? ' class="av-body_' + uid + '"' : '') + '>' +
    parts.join('') +
    '</g></svg>';
};
