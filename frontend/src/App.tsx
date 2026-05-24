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

type PredictionResult = {
  estimated_annual_cost: number
  contributions: Record<string, number>
  report: string
}

function PredictorPage() {
  const { currentUser, logout } = useAuth()
  const [form, setForm] = useState<Form>(initialForm)
  const [result, setResult] = useState<PredictionResult | null>(null)
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
      const data = await predictCost(payload)
      setResult(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const displayName = currentUser?.email?.split('@')[0] ?? 'User'

  return (
    <div style={s.pageWrapper}>
      <header style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.navIcon}>
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline
                points="2,18 7,18 10,9 13,27 16,13 19,22 22,18 34,18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div style={s.navTitle}>Healthcare Cost Estimator</div>
            <div style={s.navSub}>Welcome, {displayName}</div>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={logout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </header>

      <main style={s.main}>
        <Card
          form={form}
          set={set}
          loading={loading}
          onSubmit={handleSubmit}
          result={result}
          error={error}
        />
      </main>
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
  pageWrapper: {
    minHeight: '100vh',
    background: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  navIcon: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff 0%, #5a52e0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.3,
  },
  navSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 18px',
    borderRadius: 8,
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    color: '#475569',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    padding: '32px 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
}
