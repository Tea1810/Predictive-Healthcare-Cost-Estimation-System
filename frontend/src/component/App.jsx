import PatientForm from './PatientForm.jsx'

export default function Card({ form, set, loading, onSubmit, result, error }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <h2 style={s.cardTitle}>Client Health Information</h2>
        <p style={s.cardSubtitle}>Enter patient data to generate cost predictions</p>
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
  )
}

const s = {
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    padding: '32px 36px',
    width: '100%',
    maxWidth: 860,
  },
  cardHeader: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: '1px solid #f1f5f9',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
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
