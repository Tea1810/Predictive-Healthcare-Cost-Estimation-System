import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(friendlyError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.iconWrap}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline
              points="2,18 7,18 10,9 13,27 16,13 19,22 22,18 34,18"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 style={s.title}>Healthcare Cost Estimator</h1>
        <p style={s.subtitle}>Sign in to access predictive cost analysis</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              type="email"
              placeholder="Enter your username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={s.demoNote}>Demo mode: Use any credentials to login</p>
      </div>

      <button style={s.helpBtn} title="Help" aria-label="Help">?</button>
    </div>
  )
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    default:
      return 'Sign in failed. Please try again.'
  }
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 16px',
    background: 'linear-gradient(160deg, #dce8f8 0%, #eef2fb 50%, #f0f4ff 100%)',
    position: 'relative',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 8px 40px rgba(80,100,180,0.13)',
    padding: '48px 44px 36px',
    width: '100%',
    maxWidth: 460,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff 0%, #5a52e0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    boxShadow: '0 4px 18px rgba(108,99,255,0.4)',
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
  },
  input: {
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    background: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    color: '#1e293b',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    marginTop: 4,
    padding: '14px',
    borderRadius: 10,
    background: '#0f172a',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    letterSpacing: '0.2px',
  },
  error: {
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#c53030',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
  },
  demoNote: {
    marginTop: 20,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  helpBtn: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#1e293b',
    color: '#fff',
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  },
}
