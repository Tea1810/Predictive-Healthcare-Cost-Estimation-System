import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../../../shared/ui/Icon'
import { C } from '../../../shared/styles/tokens'

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
      navigate('/dashboard')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(friendlyError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.leftPanel}>
        <div style={s.brandArea}>
          <div style={s.brandLogo}>
            <Icon name="heartbeat" size={32} color="white" />
          </div>
          <div style={s.brandName}>MediCost</div>
        </div>
        <div style={s.heroText}>
          <h1 style={s.heroTitle}>Predictive Healthcare Cost Estimation</h1>
          <p style={s.heroSub}>Data-driven insights to help you understand and plan for healthcare expenses.</p>
        </div>
        <div style={s.featureList}>
          {['Instant cost predictions', 'Detailed patient reports', 'Risk profile analysis', 'Aggregate analytics'].map(f => (
            <div key={f} style={s.featureItem}>
              <span style={s.featureDot}>&#10003;</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div style={s.rightPanel}>
        <div style={s.formCard} className="mc-fade-up">
          <h2 style={s.formTitle}>Sign In</h2>
          <p style={s.formSub}>Access your account to continue</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
                className="mc-input"
                type="email"
                placeholder="your@email.com"
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
                className="mc-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <div style={s.error}>{error}</div>}
            <button style={s.btn} className="mc-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={s.switchLink}>
            Don't have an account?{' '}
            <Link to="/register" style={s.link} className="mc-link">Create one</Link>
          </p>
        </div>
      </div>
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
  },
  leftPanel: {
    width: '45%',
    background: '#13261B',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 56px',
    color: '#fff',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  brandArea: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 64,
  },
  brandLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: '#2A8049',
    boxShadow: '0 8px 22px rgba(42,128,73,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 23,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  heroText: {
    position: 'relative' as const,
    marginBottom: 44,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.18,
    marginBottom: 18,
    color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '-0.03em',
  },
  heroSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.66)',
    lineHeight: 1.65,
  },
  featureList: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
  },
  featureDot: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'rgba(42,128,73,0.16)',
    border: '1px solid rgba(42,128,73,0.45)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#74CE86',
    fontSize: 11,
    fontWeight: 800,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  formCard: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 24px 48px -16px rgba(15,21,17,0.22), 0 8px 18px -10px rgba(15,21,17,0.10)',
    border: '1px solid #eef1ef',
    padding: '48px 44px',
    width: '100%',
    maxWidth: 420,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: C.ink,
    marginBottom: 6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '-0.02em',
  },
  formSub: {
    fontSize: 14,
    color: '#8a958c',
    marginBottom: 32,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 18,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#475247',
  },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #e3e8e4',
    fontSize: 14,
    color: C.ink,
    background: '#f6f8f6',
    width: '100%',
  },
  btn: {
    marginTop: 6,
    padding: '14px',
    borderRadius: 12,
    background: '#2A8049',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    letterSpacing: '0.1px',
    boxShadow: '0 8px 20px -6px rgba(42,128,73,0.50)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '11px 14px',
    color: '#b91c1c',
    fontSize: 13,
  },
  switchLink: {
    marginTop: 24,
    fontSize: 13,
    color: '#8a958c',
    textAlign: 'center' as const,
  },
  link: {
    color: C.navy,
    fontWeight: 700,
    textDecoration: 'none',
  },
}
