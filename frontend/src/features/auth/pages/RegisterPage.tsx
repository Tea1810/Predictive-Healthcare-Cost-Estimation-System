import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../../../shared/ui/Icon'

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
      <div style={s.topBar}>
        <div style={s.brandArea}>
          <div style={s.brandLogo}>
            <Icon name="heartbeat" size={20} color="white" />
          </div>
          <span style={s.brandName}>MediCost</span>
        </div>
        <Link to="/login" style={s.signinLink} className="mc-btn-ghost">Already have an account? Sign In</Link>
      </div>

      <div style={s.body}>
        <div style={s.formCard} className="mc-fade-up">
          <div style={s.cardTop}>
            <h1 style={s.formTitle}>Create Account</h1>
            <p style={s.formSub}>Start estimating healthcare costs today</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Full Name</label>
                <input style={s.input} className="mc-input" type="text" value={displayName}
                  onChange={e => setDisplayName(e.target.value)} required
                  autoComplete="name" placeholder="Jane Smith" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Email Address</label>
                <input style={s.input} className="mc-input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  autoComplete="email" placeholder="your@email.com" />
              </div>
            </div>
            <div style={s.row2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <input style={s.input} className="mc-input" type="password" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  minLength={6} autoComplete="new-password" placeholder="Min. 6 characters" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Confirm Password</label>
                <input style={s.input} className="mc-input" type="password" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required
                  autoComplete="new-password" placeholder="Repeat password" />
              </div>
            </div>
            {error && <div style={s.error}>{error}</div>}
            <button style={s.btn} className="mc-btn" type="submit" disabled={loading}>
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
  },
  topBar: {
    background: 'linear-gradient(135deg, #0f1511 0%, #14241c 60%, #0a2c1e 100%)',
    borderBottom: '1px solid rgba(16,185,129,0.16)',
    padding: '18px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    boxShadow: '0 6px 16px rgba(16,185,129,0.40)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  signinLink: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.22)',
    background: 'rgba(255,255,255,0.06)',
    padding: '8px 15px',
    borderRadius: 9,
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
    borderRadius: 20,
    boxShadow: '0 24px 48px -16px rgba(15,21,17,0.22), 0 8px 18px -10px rgba(15,21,17,0.10)',
    border: '1px solid #eef1ef',
    padding: '44px 48px',
    width: '100%',
    maxWidth: 680,
  },
  cardTop: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1px solid #eef1ef',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0f1511',
    marginBottom: 6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '-0.02em',
  },
  formSub: {
    fontSize: 14,
    color: '#8a958c',
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
    color: '#0f1511',
    background: '#f6f8f6',
    width: '100%',
  },
  btn: {
    marginTop: 4,
    padding: '14px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 8px 20px -6px rgba(16,185,129,0.50)',
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
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#8a958c',
    textAlign: 'center' as const,
  },
  footerLink: {
    color: '#059669',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
