import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000'
})

export async function predictCost(payload) {
    const { data } = await api.post('/predict', payload)
    return data.estimated_annual_cost
}
