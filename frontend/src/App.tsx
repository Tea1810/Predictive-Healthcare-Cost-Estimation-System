import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { predictCost } from './assets/api.js'
import { FIELDS, initialForm } from './constants/fields.js'
import Card from './component/App.jsx'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'

type Form = typeof initialForm

function PredictorPage() {
  const { currentUser, logout } = useAuth()
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
    <div style={{ position: 'relative' }}>
      <div style={s.topbar}>
        <span style={s.userEmail}>{currentUser?.email}</span>
        <button style={s.signOutBtn} onClick={logout}>Sign Out</button>
      </div>
      <Card
        form={form}
        set={set}
        loading={loading}
        onSubmit={handleSubmit}
        result={result}
        error={error}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PredictorPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

const s: Record<string, React.CSSProperties> = {
  topbar: {
    position: 'fixed',
    top: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 20px',
    zIndex: 100,
  },
  userEmail: { fontSize: 13, color: '#718096' },
  signOutBtn: {
    padding: '6px 14px',
    borderRadius: 6,
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    color: '#4a5568',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
}
