import axios from 'axios'
import { auth } from '../firebase'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000'
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
    return data.estimated_annual_cost
}
