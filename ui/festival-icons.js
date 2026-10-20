// Month-cell pictograms: our own simple 24x24 line symbols, one per day, chosen from the day's events.
// Pure data and DOM building; no engine change. Festivals outrank vratas; the first listed event wins.

/** Symbol key -> Telugu and English names plus inline SVG shapes (stroke/fill use currentColor). */
export const SYMBOLS = {
  lamp: { te: 'దీపం', en: 'Lamp', svg: '<path d="M4 15h16l-2 4H6z"/><path d="M12 14c-2-2-2-4 0-7 2 3 2 5 0 7z" class="f"/>' },
  burst: { te: 'రంగులు', en: 'Colours', svg: '<circle cx="12" cy="12" r="2.5" class="f"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>' },
  kalasam: { te: 'కలశం', en: 'Kalasam', svg: '<path d="M8 8h8M9 8c-3 3-3 9 0 12h6c3-3 3-9 0-12"/><path d="M12 8V5M10 5c1-2 3-2 4 0" /><ellipse cx="12" cy="4" rx="2" ry="1.2" class="f"/>' },
  trident: { te: 'త్రిశూలం', en: 'Trident', svg: '<path d="M12 21V8M6 5v4c0 2 2 3 6 3s6-1 6-3V5M12 3v5"/>' },
  conch: { te: 'శంఖం', en: 'Conch', svg: '<path d="M5 15c0-5 4-9 9-9 3 0 5 2 5 5s-3 7-8 7c-3 0-6-1-6-3z"/><path d="M9 14c1-3 3-4 6-4M12 18c-2-1-3-3-2-6"/>' },
  bow: { te: 'ధనుస్సు', en: 'Bow', svg: '<path d="M6 3c8 3 8 15 0 18"/><path d="M6 3v18"/><path d="M6 12h14M16 9l4 3-4 3"/>' },
  flute: { te: 'వేణువు', en: 'Flute', svg: '<path d="M4 18L18 4l2 2L6 20z"/><circle cx="10" cy="14" r=".8" class="f"/><circle cx="13" cy="11" r=".8" class="f"/><circle cx="16" cy="8" r=".8" class="f"/>' },
  ganesha: { te: 'గణపతి', en: 'Ganesha', svg: '<circle cx="7" cy="9" r="3.5"/><circle cx="17" cy="9" r="3.5"/><circle cx="12" cy="10" r="4" class="bg"/><path d="M12 13c0 4 0 6-3 7M10 6l2-3 2 3"/>' },
  sun: { te: 'సూర్యుడు', en: 'Sun', svg: '<circle cx="12" cy="12" r="4" class="f"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>' },
  star: { te: 'పండుగ', en: 'Festival', svg: '<path d="M12 3l2.6 6 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.2 1.4-6.3L3 9.6 9.4 9z" class="f"/>' }
};

/** Event ID -> symbol key. Anything unlisted falls back to the generic star. Tithi vratas that
 * already carry a moon mark (Purnima, Amavasya) get none. */
const TABLE = {
  lamp: ['DEEPAVALI', 'KARTHIKA_PURNIMA', 'KARTHIKA_MASA_START', 'KARTHIKA_SOMAVARAM', 'NARAKA_CHATURDASHI'],
  burst: ['HOLI', 'UGADI'],
  kalasam: ['VARALAKSHMI_VRATAM', 'SHRAVANA_MANGALAVARAM', 'BONALU', 'ENGILI_PULA_BATHUKAMMA', 'SADDULA_BATHUKAMMA', 'NAVARATRI_START', 'DURGASHTAMI', 'MAHANAVAMI'],
  trident: ['MAHA_SHIVARATRI', 'VRATA:KRISHNA_PRADOSHAM', 'VRATA:SHUKLA_PRADOSHAM', 'VRATA:MASA_SHIVARATRI'],
  conch: ['TOLI_EKADASHI', 'UTTHANA_EKADASHI', 'VAIKUNTA_EKADASHI', 'BHISHMA_EKADASHI', 'KSHEERABDI_DWADASHI', 'NARASIMHA_JAYANTI', 'VRATA:KRISHNA_EKADASHI', 'VRATA:SHUKLA_EKADASHI'],
  bow: ['SRI_RAMA_NAVAMI', 'HANUMAN_JAYANTI_TELUGU', 'VIJAYADASHAMI'],
  flute: ['KRISHNASHTAMI'],
  ganesha: ['VINAYAKA_CHAVITHI', 'VRATA:SANKASHTI_CHATURTHI'],
  sun: ['MAKARA_SANKRANTI', 'BHOGI', 'KANUMA', 'MUKKANUMA', 'RATHA_SAPTAMI']
};
const NONE = new Set(['VRATA_PURNIMA', 'VRATA_AMAVASYA']);

const BY_ID = {};
for (const [key, ids] of Object.entries(TABLE)) {
  for (const id of ids) BY_ID[id.startsWith('VRATA:') ? `VRATA_${id.slice(6)}` : `FESTIVAL_${id}`] = key;
}

/** Symbol key for one event ID, or null when the cell should carry no pictogram. */
export function symbolForEvent(id) {
  if (NONE.has(id)) return null;
  return BY_ID[id] || 'star';
}

/** Symbol key for a day: the first festival that has one, else the first vrata. `events` are in priority order. */
export function symbolForDay(events) {
  for (const e of events) {
    const key = symbolForEvent(e.id);
    if (key) return key;
  }
  return null;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** An inline <svg> for a symbol key, or null. The caller sets the accessible name. */
export function iconElement(doc, key, size = 18) {
  const sym = SYMBOLS[key];
  if (!sym) return null;
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('class', 'fest-icon');
  svg.innerHTML = sym.svg;
  return svg;
}
