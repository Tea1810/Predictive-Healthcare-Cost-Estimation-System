import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await register(email, password, displayName)
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
      <div style={s.topBar}>
        <div style={s.brandArea}>
          <div style={s.brandLogo}>
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <polyline points="2,18 7,18 10,9 13,27 16,13 19,22 22,18 34,18"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={s.brandName}>MediCost</span>
        </div>
        <Link to="/login" style={s.signinLink}>Already have an account? Sign In</Link>
      </div>

      <div style={s.body}>
        <div style={s.formCard}>
          <div style={s.cardTop}>
            <h1 style={s.formTitle}>Create Account</h1>
            <p style={s.formSub}>Start estimating healthcare costs today</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Full Name</label>
                <input style={s.input} type="text" value={displayName}
                  onChange={e => setDisplayName(e.target.value)} required
                  autoComplete="name" placeholder="Jane Smith" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Email Address</label>
                <input style={s.input} type="email" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  autoComplete="email" placeholder="your@email.com" />
              </div>
            </div>
            <div style={s.row2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <input style={s.input} type="password" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  minLength={6} autoComplete="new-password" placeholder="Min. 6 characters" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Confirm Password</label>
                <input style={s.input} type="password" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required
                  autoComplete="new-password" placeholder="Repeat password" />
              </div>
            </div>
            {error && <div style={s.error}>{error}</div>}
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={s.footer}>
            By creating an account you agree to our{' '}
            <span style={s.footerLink}>Terms of Service</span> and{' '}
            <span style={s.footerLink}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    default:
      return 'Registration failed. Please try again.'
  }
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f4f6f4',
  },
  topBar: {
    background: '#006838',
    padding: '16px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '-0.2px',
  },
  signinLink: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    border: '1.5px solid rgba(255,255,255,0.35)',
    padding: '6px 14px',
    borderRadius: 6,
  },
  body: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
  },
  formCard: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,60,30,0.10)',
    padding: '44px 48px',
    width: '100%',
    maxWidth: 680,
  },
  cardTop: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1.5px solid #edf2ed',
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
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 20px',
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
  },
  btn: {
    marginTop: 4,
    padding: '13px',
    borderRadius: 8,
    background: '#006838',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  error: {
    background: '#fff5f5',
    border: '1px solid #fcbcbc',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#c53030',
    fontSize: 13,
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#9aaa9a',
    textAlign: 'center' as const,
  },
  footerLink: {
    color: '#006838',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
