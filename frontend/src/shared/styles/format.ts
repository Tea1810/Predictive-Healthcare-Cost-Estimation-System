/** Number/currency formatters shared across analytics views. */
export const usd = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US')

export const usdCompact = (n: number) =>
  '$' + n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export const count = (n: number) => Math.round(n).toLocaleString('en-US')

export const pct1 = (n: number) => `${n.toFixed(1)}%`
