export type Stats = {
  cost_basis: 'predicted' | 'billed' | 'reimbursed'
  cost_tiers: { low_max: number; high_min: number }
  total_patients: number
  total_predicted_cost: number
  average_cost: number
  tier_counts: { low: number; med: number; high: number }
  top_decile_cost_share: number
  cost_by_age: { band: string; avg_cost: number }[]
  mom_pct: number | null
  reports_this_month: number
  reports_last_month: number
  tier_by_month: { month: string; label: string; low: number; med: number; high: number }[]
  weekly_this_month: { week: number; cost: number }[]
  weekly_last_month: { week: number; cost: number }[]
}
