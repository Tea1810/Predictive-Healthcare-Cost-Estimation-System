import { apiClient } from '../../shared/lib/apiClient'
import type { PredictionResult } from './types'

export async function predictCost(payload: Record<string, number>): Promise<PredictionResult> {
  const { data } = await apiClient.post<PredictionResult>('/predict', payload)
  return data
}

interface DownloadReportArgs {
  estimated_annual_cost: number
  contributions: Record<string, number>
  report: string
  patient_name: string
  patient: { age: number; gender: number; is_smoker: number; num_diseases: number }
}

export async function downloadReport(args: DownloadReportArgs) {
  const response = await apiClient.post('/report/pdf', args, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `healthcare-cost-report-${Date.now()}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
