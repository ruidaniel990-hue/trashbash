// ── Trash Categories & Items ──
// Each category has: name (display), icon (emoji), cls (CSS class), items array

export const CATEGORIES = {
  gelb: {
    name: 'Gelbe Tonne',
    icon: '🟡',
    cls: 'bin-gelb',
    items: [
      { emoji: '🛍️', name: 'Plastiktüte' },
      { emoji: '🧴', name: 'Shampooflasche' },
      { emoji: '🥤', name: 'Plastikbecher' },
      { emoji: '🥫', name: 'Konservendose' },
      { emoji: '🍫', name: 'Schokopack' },
      { emoji: '🧃', name: 'Getränkekarton' },
      { emoji: '🪣', name: 'Kunststoffeimer' },
      { emoji: '🧽', name: 'Verpackungsfolie' },
    ],
  },
  glas: {
    name: 'Glascontainer',
    icon: '🫙',
    cls: 'bin-glas',
    items: [
      { emoji: '🍾', name: 'Weinflasche' },
      { emoji: '🫙', name: 'Einmachglas' },
      { emoji: '🍶', name: 'Glasflasche' },
      { emoji: '🥂', name: 'Sektflasche' },
      { emoji: '🧪', name: 'Laborfläschchen' },
      { emoji: '💊', name: 'Medizinflasche' },
    ],
  },
  papier: {
    name: 'Papiertonne',
    icon: '📦',
    cls: 'bin-papier',
    items: [
      { emoji: '📰', name: 'Zeitung' },
      { emoji: '📦', name: 'Karton' },
      { emoji: '📚', name: 'Alte Bücher' },
      { emoji: '🗞️', name: 'Zeitschrift' },
      { emoji: '✉️', name: 'Briefumschlag' },
      { emoji: '🗒️', name: 'Notizheft' },
    ],
  },
  bio: {
    name: 'Biotonne',
    icon: '🌱',
    cls: 'bin-bio',
    items: [
      { emoji: '🍌', name: 'Bananenschale' },
      { emoji: '🥚', name: 'Eierschale' },
      { emoji: '☕', name: 'Kaffeesatz' },
      { emoji: '🍎', name: 'Apfelrest' },
      { emoji: '🌿', name: 'Gartenabfall' },
      { emoji: '🥕', name: 'Gemüsereste' },
      { emoji: '🍞', name: 'Altbrot' },
    ],
  },
  rest: {
    name: 'Restmüll',
    icon: '🗑️',
    cls: 'bin-rest',
    items: [
      { emoji: '🍕', name: 'Pizzakarton (fettig)' },
      { emoji: '💡', name: 'Glühbirne' },
      { emoji: '🩺', name: 'Pflaster' },
      { emoji: '🧼', name: 'Seifenreste' },
      { emoji: '🍬', name: 'Bonbonpapier' },
      { emoji: '🖊️', name: 'Kugelschreiber' },
      { emoji: '🪥', name: 'Zahnbürste' },
    ],
  },
  sonder: {
    name: 'Sondermüll',
    icon: '☢️',
    cls: 'bin-sonder',
    items: [
      { emoji: '🔋', name: 'Batterie' },
      { emoji: '🎨', name: 'Lackreste' },
      { emoji: '💊', name: 'Medikamente' },
      { emoji: '🧪', name: 'Chemikalien' },
      { emoji: '🖨️', name: 'Druckerpatronen' },
      { emoji: '📱', name: 'Altes Handy' },
      { emoji: '💻', name: 'Elektroschrott' },
      { emoji: '🛢️', name: 'Altöl' },
    ],
  },
};

export const CAT_KEYS = Object.keys(CATEGORIES);
