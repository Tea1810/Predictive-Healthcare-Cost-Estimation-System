import { apiClient } from '../../shared/lib/apiClient'
import type { Report } from './types'

/** The signed-in user's saved reports, newest first (ordered server-side). */
export async function listReports(): Promise<Report[]> {
  const { data } = await apiClient.get<Report[]>('/reports')
  return data
}

export async function renameReport(id: string, name: string): Promise<void> {
  await apiClient.patch(`/reports/${id}`, { name })
}

/**
 * Open a report's stored PDF in a new tab. The blank tab is opened
 * synchronously (inside the click gesture) so popup blockers don't intervene,
 * then pointed at the fetched blob once it arrives.
 */
export async function openReportPdf(id: string): Promise<void> {
  const tab = window.open('', '_blank')
  try {
    const res = await apiClient.get(`/reports/${id}/pdf`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    if (tab) tab.location.href = url
    else window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (e) {
    tab?.close()
    throw e
  }
}
