export type Report = {
  id: string
  name: string
  cost: number
  /** ISO timestamp, or null if it was never recorded. */
  created_at: string | null
}
