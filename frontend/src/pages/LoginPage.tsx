import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

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
        <div style={s.header}>
          <span style={s.icon}>&#10084;</span>
          <div>
            <h1 style={s.title}>Healthcare Cost Estimator</h1>
            <p style={s.subtitle}>Sign in to your account</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <label style={s.label}>Password</label>
          <input
            style={s.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={s.footer}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={s.link}>Register</Link>
        </p>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 16px',
    background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f4f8 100%)',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
    padding: '36px 40px',
    width: '100%',
    maxWidth: 420,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: '1px solid #e2e8f0',
  },
  icon: { fontSize: 32, color: '#e53e3e' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a202c', lineHeight: 1.2 },
  subtitle: { fontSize: 13, color: '#718096', marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 13, fontWeight: 600, color: '#4a5568' },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    outline: 'none',
    color: '#1a202c',
  },
  btn: {
    marginTop: 8,
    padding: '11px',
    borderRadius: 8,
    background: '#3182ce',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
  },
  error: {
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#c53030',
    fontSize: 13,
  },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 13, color: '#718096' },
  link: { color: '#3182ce', fontWeight: 600, textDecoration: 'none' },
}
