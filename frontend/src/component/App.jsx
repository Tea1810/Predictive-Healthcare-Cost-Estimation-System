import PatientForm from './PatientForm.jsx'

export default function Card({ form, set, loading, onSubmit, result, error }) {
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.headerIcon}>&#10084;</div>
          <div>
            <h1 style={s.title}>Healthcare Cost Estimator</h1>
            <p style={s.subtitle}>Predict annual healthcare costs from patient clinical data</p>
          </div>
        </div>

        <PatientForm form={form} set={set} loading={loading} onSubmit={onSubmit} />

        {result !== null && (
          <div style={s.result}>
            <div style={s.resultLabel}>Estimated Annual Healthcare Cost</div>
            <div style={s.resultValue}>
              ${result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {error && (
          <div style={s.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 16px',
    background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f4f8 100%)',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
    padding: '36px 40px',
    width: '100%',
    maxWidth: 860,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1px solid #e2e8f0',
  },
  headerIcon: { fontSize: 36, color: '#e53e3e' },
  title: { fontSize: 24, fontWeight: 700, color: '#1a202c', lineHeight: 1.2 },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  result: {
    marginTop: 28,
    background: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)',
    border: '1.5px solid #90cdf4',
    borderRadius: 12,
    padding: '24px 28px',
    textAlign: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#2c5282',
    fontWeight: 500,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  resultValue: { fontSize: 40, fontWeight: 800, color: '#1a365d' },
  errorBox: {
    marginTop: 20,
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: 10,
    padding: '14px 18px',
    color: '#c53030',
    fontSize: 14,
  },
}
