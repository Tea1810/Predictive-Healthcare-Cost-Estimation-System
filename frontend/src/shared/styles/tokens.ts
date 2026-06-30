/**
 * Design tokens — the single source of truth for the palette.
 *
 * `C` is the navy/orange analytics palette used across the dashboard. Tier
 * colours are derived from it so the bars, donut legend and KPIs stay in sync.
 */
export const C = {
  navy: '#0C447C',
  navyActive: '#14538C',
  orange: '#EF9F27',
  steel: '#85B7EB',
  track: '#E6F1FB',
  sidebarText: '#B5D4F4',
  ink: '#0f1828',
  mid: '#48566a',
  muted: '#8593a6',
  border: '#e6ebf2',
  surface: '#ffffff',
} as const

/** Cost-tier colours, shared across the tier bars, donut legend and KPIs. */
export const TIER = {
  high: C.navy,
  med: C.orange,
  low: C.steel,
} as const
