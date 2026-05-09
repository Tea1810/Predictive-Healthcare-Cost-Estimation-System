import { useState } from 'react'
import { predictCost } from './assets/api.js'
import { FIELDS, initialForm } from './constants/fields.js'
import Card from './component/App.jsx'

type Form = typeof initialForm

export default function App() {
  const [form, setForm] = useState<Form>(initialForm)
  const [result, setResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const payload: Record<string, number> = {
      age: parseInt(form.age),
      gender: parseInt(form.gender),
      num_diseases: parseInt(form.num_diseases),
      is_smoker: parseInt(form.is_smoker),
    }
    FIELDS.optional.forEach(({ key }: { key: keyof Form }) => {
      const v = form[key]
      if (v !== '') payload[key as string] = parseFloat(v)
    })

    try {
      const cost = await predictCost(payload)
      setResult(cost)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      form={form}
      set={set}
      loading={loading}
      onSubmit={handleSubmit}
      result={result}
      error={error}
    />
  )
}
