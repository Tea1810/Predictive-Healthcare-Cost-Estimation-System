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
import Icon from './components/Icon'
import { CsvService } from './services/CsvService'

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
  const [csvRows, setCsvRows] = useState<Form[]>([])
  const [csvIndex, setCsvIndex] = useState(-1)

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
    <div style={s.pageWrapper}>
      <header style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.navLogo}>
            <Icon name="heartbeat" size={20} color="white" />
          </div>
          <div>
            <div style={s.navTitle}>MediCost</div>
            <div style={s.navSub}>Healthcare Cost Estimator</div>
          </div>
        </div>
        <div style={s.navRight}>
          <a href="/dashboard" style={s.dashLink} className="mc-btn-ghost">Analytics</a>
          <div style={s.userChip}>
            <div style={s.userAvatar}>{displayName.charAt(0).toUpperCase()}</div>
            <span style={s.userName}>{displayName}</span>
          </div>
          <button style={s.logoutBtn} className="mc-btn-ghost" onClick={logout} aria-label="Sign out">
            <Icon name="logout" size={16} />
          </button>
        </div>
      </header>

      <div style={s.heroBanner}>
        <div style={s.heroGlow} />
        <div style={s.heroContent}>
          <span style={s.heroEyebrow}>AI-POWERED ESTIMATION</span>
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
          csvRows={csvRows}
          csvIndex={csvIndex}
          onCsvLoad={handleCsvLoad}
          onCsvPrev={csvPrev}
          onCsvNext={csvNext}
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
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(15,21,17,0.92)',
    backdropFilter: 'saturate(140%) blur(10px)',
    WebkitBackdropFilter: 'saturate(140%) blur(10px)',
    borderBottom: '1px solid rgba(16,185,129,0.18)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(15,21,17,0.18)',
    padding: '0 32px',
    height: 68,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  navLogo: {
    width: 42, height: 42, borderRadius: 12,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 6px 16px rgba(16,185,129,0.40)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  navTitle: { fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' },
  navSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  navRight: { display: 'flex', alignItems: 'center', gap: 10 },
  userChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '5px 14px 5px 6px', borderRadius: 999,
    background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.30)',
  },
  userAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'linear-gradient(135deg, #34d399, #059669)',
    color: '#04130c', fontSize: 12, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: 13, fontWeight: 600, color: '#a7f3d0' },
  dashLink: {
    padding: '8px 16px', borderRadius: 9,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.92)',
    fontWeight: 600, fontSize: 13, textDecoration: 'none',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', padding: '8px 11px',
    borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
    color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
  },
  heroBanner: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0f1511 0%, #15241c 55%, #0a2c1e 100%)',
    padding: '44px 0 48px',
    overflow: 'hidden',
    borderBottom: '1px solid rgba(16,185,129,0.14)',
  },
  heroGlow: {
    position: 'absolute', top: -120, right: -80, width: 380, height: 380,
    background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 65%)',
    filter: 'blur(8px)', pointerEvents: 'none',
  },
  heroContent: { position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '0 32px' },
  heroEyebrow: {
    display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
    color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.30)',
    padding: '5px 12px', borderRadius: 999, marginBottom: 16,
  },
  heroTitle: { fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.66)', maxWidth: 560 },
  main: {
    flex: 1, padding: '36px 24px 48px',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box',
  },
  footer: { background: 'var(--ink)', borderTop: '1px solid rgba(16,185,129,0.14)' },
  footerInner: {
    maxWidth: 1000, margin: '0 auto', padding: '20px 32px',
    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
  },
  footerBrand: { fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  footerText: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
}
