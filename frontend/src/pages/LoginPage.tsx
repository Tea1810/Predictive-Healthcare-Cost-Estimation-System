import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../components/Icon'

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
              <span style={s.featureDot} />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div style={s.rightPanel}>
        <div style={s.formCard}>
          <h2 style={s.formTitle}>Sign In</h2>
          <p style={s.formSub}>Access your account to continue</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
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

          <p style={s.switchLink}>
            Don't have an account?{' '}
            <Link to="/register" style={s.link}>Create one</Link>
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
    background: '#004d29',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 52px',
    color: '#fff',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  brandArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 64,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid rgba(255,255,255,0.25)',
  },
  brandName: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '-0.3px',
    color: '#fff',
  },
  heroText: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 16,
    color: '#fff',
  },
  heroSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.6,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#00e676',
    flexShrink: 0,
    display: 'block',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    background: '#f4f6f4',
  },
  formCard: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,60,30,0.10)',
    padding: '48px 44px',
    width: '100%',
    maxWidth: 420,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#1a1f1a',
    marginBottom: 6,
  },
  formSub: {
    fontSize: 14,
    color: '#7a8a7a',
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
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4a5a4a',
  },
  input: {
    padding: '11px 14px',
    borderRadius: 8,
    border: '1.5px solid #dde3dd',
    fontSize: 14,
    color: '#1a1f1a',
    background: '#fff',
    width: '100%',
    transition: 'border-color 0.15s',
  },
  btn: {
    marginTop: 6,
    padding: '13px',
    borderRadius: 8,
    background: '#006838',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    letterSpacing: '0.1px',
    transition: 'background 0.15s',
  },
  error: {
    background: '#fff5f5',
    border: '1px solid #fcbcbc',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#c53030',
    fontSize: 13,
  },
  switchLink: {
    marginTop: 24,
    fontSize: 13,
    color: '#7a8a7a',
    textAlign: 'center' as const,
  },
  link: {
    color: '#006838',
    fontWeight: 600,
    textDecoration: 'none',
  },
}
