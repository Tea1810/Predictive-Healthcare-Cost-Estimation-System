import { useState } from 'react'
import type { ChangeEvent, CSSProperties, FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { predictCost } from '../api'
import { CsvService } from '../csv'
import { FIELDS, initialForm } from '../constants'
import type { Form, PredictionResult } from '../types'
import PredictorCard from '../components/PredictorCard'
import Sidebar from '../../../shared/ui/Sidebar'
import { C } from '../../../shared/styles/tokens'

export default function PredictorPage() {
  const { currentUser, logout } = useAuth()
  const [form, setForm] = useState<Form>(initialForm)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvRows, setCsvRows] = useState<Form[]>([])
  const [csvIndex, setCsvIndex] = useState(-1)

  const set = (key: keyof Form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
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
    FIELDS.optional.forEach(({ key }) => {
      const v = form[key as keyof Form]
      if (v !== '') payload[key] = parseFloat(v)
    })

    try {
      const data = await predictCost(payload)
      setResult(data)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string }
      setError(axiosErr.response?.data?.detail ?? axiosErr.message ?? 'Estimation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCsvLoad = (file: File) => {
    CsvService.parseFile(file)
      .then(rows => {
        setCsvRows(rows)
        setCsvIndex(0)
        setForm(rows[0])
        setResult(null)
        setError(null)
      })
      .catch(err => setError((err as Error).message))
  }

  const csvPrev = () => {
    if (csvIndex <= 0) return
    const idx = csvIndex - 1
    setCsvIndex(idx)
    setForm(csvRows[idx])
    setResult(null)
  }

  const csvNext = () => {
    if (csvIndex >= csvRows.length - 1) return
    const idx = csvIndex + 1
    setCsvIndex(idx)
    setForm(csvRows[idx])
    setResult(null)
  }

  const displayName = currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'User'

  return (
    <div style={s.shell}>
      <Sidebar subtitle="Estimator" onSignOut={logout} />
      <main style={s.main}>
        <PredictorCard
          form={form}
          set={set}
          loading={loading}
          onSubmit={handleSubmit}
          result={result}
          error={error}
          patientName={displayName}
          csvRows={csvRows}
          csvIndex={csvIndex}
          onCsvLoad={handleCsvLoad}
          onCsvPrev={csvPrev}
          onCsvNext={csvNext}
        />
      </main>
    </div>
  )
}

const s: Record<string, CSSProperties> = {
  shell: { minHeight: '100vh', display: 'flex', background: C.pageBg },
  main: {
    flex: 1, minWidth: 0,
    padding: '40px 32px 56px',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    boxSizing: 'border-box',
  },
}
