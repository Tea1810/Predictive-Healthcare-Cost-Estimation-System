import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { predictCost } from './assets/api.js'
import { FIELDS, initialForm } from './constants/fields.js'
import Card from './component/App.jsx'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string }
      setError(axiosErr.response?.data?.detail ?? axiosErr.message ?? 'Estimation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const displayName = currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'User'

  return (
    <div style={s.pageWrapper}>
      <header style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.navLogo}>
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <polyline points="2,18 7,18 10,9 13,27 16,13 19,22 22,18 34,18"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={s.navTitle}>MediCost</div>
            <div style={s.navSub}>Healthcare Cost Estimator</div>
          </div>
        </div>
        <div style={s.navRight}>
          <a href="/dashboard" style={s.dashLink}>Analytics</a>
          <div style={s.userChip}>
            <div style={s.userAvatar}>{displayName.charAt(0).toUpperCase()}</div>
            <span style={s.userName}>{displayName}</span>
          </div>
          <button style={s.logoutBtn} onClick={logout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <div style={s.heroBanner}>
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>Cost Estimation</h1>
          <p style={s.heroSub}>Fill in the patient details below to receive an AI-powered annual healthcare cost estimate.</p>
        </div>
      </div>

      <main style={s.main}>
        <Card
          form={form}
          set={set}
          loading={loading}
          onSubmit={handleSubmit}
          result={result}
          error={error}
          patientName={displayName}
        />
      </main>

      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerBrand}>MediCost</span>
          <span style={s.footerText}>Predictions are estimates only and do not constitute medical or financial advice.</span>
        </div>
      </footer>
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
          <Route path="/dashboard" element={<DashboardPage />} />
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
    background: '#f4f6f4',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#fff',
    borderBottom: '1.5px solid #dde3dd',
    boxShadow: '0 1px 4px rgba(0,60,30,0.06)',
    padding: '0 32px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  navLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#006838',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navTitle: { fontSize: 17, fontWeight: 800, color: '#1a1f1a', lineHeight: 1.2 },
  navSub: { fontSize: 12, color: '#7a8a7a', marginTop: 2 },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 12px 5px 6px',
    borderRadius: 20,
    background: '#e8f5ee',
    border: '1.5px solid #b2dfc4',
    marginRight: 4,
  },
  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#006838',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontSize: 13, fontWeight: 600, color: '#006838' },
  dashLink: {
    padding: '7px 16px',
    borderRadius: 7,
    background: '#f4f6f4',
    border: '1.5px solid #dde3dd',
    color: '#4a5a4a',
    fontWeight: 600,
    fontSize: 13,
    textDecoration: 'none',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 4px',
    borderRadius: 7,
    background: '#fff',
    border: '1.5px solid #dde3dd',
    color: '#7a8a7a',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  heroBanner: {
    background: '#004d29',
    padding: '28px 0',
  },
  heroContent: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '0 32px',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#fff',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  main: {
    flex: 1,
    padding: '36px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    maxWidth: 1000,
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  footer: {
    background: '#fff',
    borderTop: '1.5px solid #dde3dd',
  },
  footerInner: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: 800,
    color: '#006838',
  },
  footerText: {
    fontSize: 12,
    color: '#9aaa9a',
  },
}
