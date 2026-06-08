import axios from 'axios'
import { auth } from '../firebase'

const api = axios.create({
    baseURL: '/api'
})

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser
    if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export async function predictCost(payload) {
    const { data } = await api.post('/predict', payload)
    return data  // { estimated_annual_cost, contributions, report }
}

export async function downloadReport({ estimated_annual_cost, contributions, report, patient_name, patient }) {
    const response = await api.post(
        '/report/pdf',
        { estimated_annual_cost, contributions, report, patient_name, patient },
        { responseType: 'blob' },
    )
    const url = URL.createObjectURL(response.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `healthcare-cost-report-${Date.now()}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
