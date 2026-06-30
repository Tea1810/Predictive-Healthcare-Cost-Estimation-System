/**
 * Design tokens — the single source of truth for the palette.
 *
 * Green brand system. `navy`/`navyActive` keep their names for call-site
 * stability but now hold the brand greens; `dark` is the deep surface used for
 * the sidebar and hero card. Tier colours form a 3-step green scale.
 */
export const C = {
  // Brand greens — interactive elements, accents, chart lines
  navy: '#2A8049',        // brand / buttons / primary accent
  navyActive: '#1B5E37',  // forest — logo, active nav, hover
  dark: '#13261B',        // deep surface — sidebar + hero card

  // Secondary chart series / supporting greens
  orange: '#74CE86',      // light green (e.g. "last month" series)
  steel: '#46A45F',       // mid green
  mint: '#D2F1DA',        // pill / soft fill background
  track: '#D2F1DA',       // bar + donut track

  // Text on dark surfaces
  sidebarText: '#A7C3B0',

  // Neutrals
  ink: '#1B201C',         // headings
  mid: '#566159',         // secondary text
  muted: '#99A29B',       // muted text
  border: '#E2E4DB',      // hairline borders
  surface: '#ffffff',     // card surface
  pageBg: '#F2F3ED',      // page background

  // Accent
  red: '#E5484D',         // negative / rising-cost pill
} as const

/** Cost-tier colours — dark→light green scale, shared across bars, donut legend, KPIs. */
export const TIER = {
  high: '#1B5E37',  // forest
  med: '#46A45F',   // mid green
  low: '#74CE86',   // light green
} as const
