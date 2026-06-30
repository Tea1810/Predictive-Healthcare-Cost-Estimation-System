import { apiClient } from '../../shared/lib/apiClient'
import type { Stats } from './types'

export async function getDashboardStats(): Promise<Stats> {
  const { data } = await apiClient.get<Stats>('/dashboard')
  return data
}
