import { useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/predict'

const FIELDS = {
  required: [
    { key: 'age',          label: 'Age',              type: 'number', min: 0,   max: 120, step: 1,    placeholder: 'e.g. 45' },
    { key: 'num_diseases', label: 'Number of Diseases', type: 'number', min: 0, max: 50,  step: 1,    placeholder: 'e.g. 2' },
  ],
  optional: [
    { key: 'bmi',            label: 'BMI',              unit: 'kg/m²',  step: 0.1, placeholder: '18–40' },
    { key: 'systolic_bp',    label: 'Systolic BP',      unit: 'mmHg',   step: 1,   placeholder: '90–180' },
    { key: 'diastolic_bp',   label: 'Diastolic BP',     unit: 'mmHg',   step: 1,   placeholder: '60–120' },
    { key: 'heart_rate',     label: 'Heart Rate',       unit: '/min',   step: 1,   placeholder: '40–120' },
    { key: 'hba1c',          label: 'HbA1c',            unit: '%',      step: 0.1, placeholder: '4–14' },
    { key: 'glucose',        label: 'Glucose',          unit: 'mg/dL',  step: 1,   placeholder: '70–400' },
    { key: 'hdl_cholesterol',label: 'HDL Cholesterol',  unit: 'mg/dL',  step: 1,   placeholder: '20–100' },
    { key: 'triglycerides',  label: 'Triglycerides',    unit: 'mg/dL',  step: 1,   placeholder: '50–500' },
    { key: 'pain_score',     label: 'Pain Score',       unit: '0–10',   step: 0.5, placeholder: '0–10' },
    { key: 'creatinine',     label: 'Creatinine',       unit: 'mg/dL',  step: 0.01,placeholder: '0.5–5' },
    { key: 'egfr',           label: 'eGFR',             unit: '',       step: 1,   placeholder: '5–120' },
    { key: 'hemoglobin',     label: 'Hemoglobin',       unit: 'g/dL',   step: 0.1, placeholder: '7–18' },
    { key: 'qaly_score',     label: 'QALY Score',       unit: '0–1',    step: 0.01,placeholder: '0–1' },
    { key: 'gad7_score',     label: 'GAD-7 Score',      unit: '0–21',   step: 1,   placeholder: '0–21' },
  ],
}

const initialForm = {
  age: '',
  gender: '0',
  num_diseases: '',
  is_smoker: '0',
  bmi: '', systolic_bp: '', diastolic_bp: '', heart_rate: '',
  hba1c: '', glucose: '', hdl_cholesterol: '', triglycerides: '',
  pain_score: '', creatinine: '', egfr: '', hemoglobin: '',
  qaly_score: '', gad7_score: '',
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const payload = {
      age: parseInt(form.age),
      gender: parseInt(form.gender),
      num_diseases: parseInt(form.num_diseases),
      is_smoker: parseInt(form.is_smoker),
    }
    FIELDS.optional.forEach(({ key }) => {
      const v = form[key]
      if (v !== '') payload[key] = parseFloat(v)
    })

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setResult(data.estimated_annual_cost)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerIcon}>&#10084;</div>
          <div>
            <h1 style={s.title}>Healthcare Cost Estimator</h1>
            <p style={s.subtitle}>Predict annual healthcare costs from patient clinical data</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Patient Info */}
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Patient Information</h2>
            <div style={s.grid2}>
              {FIELDS.required.map(({ key, label, type, min, max, step, placeholder }) => (
                <div key={key} style={s.field}>
                  <label style={s.label}>{label} <span style={s.req}>*</span></label>
                  <input
                    style={s.input}
                    type={type}
                    min={min} max={max} step={step}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                    required
                  />
                </div>
              ))}

              <div style={s.field}>
                <label style={s.label}>Gender <span style={s.req}>*</span></label>
                <select style={s.select} value={form.gender} onChange={set('gender')} required>
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>Smoker <span style={s.req}>*</span></label>
                <select style={s.select} value={form.is_smoker} onChange={set('is_smoker')} required>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>
          </section>

          {/* Clinical Measurements */}
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Clinical Measurements <span style={s.optional}>(optional)</span></h2>
            <div style={s.grid3}>
              {FIELDS.optional.map(({ key, label, unit, step, placeholder }) => (
                <div key={key} style={s.field}>
                  <label style={s.label}>
                    {label}
                    {unit && <span style={s.unit}> {unit}</span>}
                  </label>
                  <input
                    style={s.input}
                    type="number"
                    step={step}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                  />
                </div>
              ))}
            </div>
          </section>

          <button type="submit" style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading}>
            {loading ? 'Estimating...' : 'Estimate Cost'}
          </button>
        </form>

        {/* Result */}
        {result !== null && (
          <div style={s.result}>
            <div style={s.resultLabel}>Estimated Annual Healthcare Cost</div>
            <div style={s.resultValue}>${result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        )}

        {/* Error */}
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
  headerIcon: {
    fontSize: 36,
    color: '#e53e3e',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a202c',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  optional: {
    fontWeight: 400,
    textTransform: 'none',
    fontSize: 13,
    color: '#a0aec0',
    letterSpacing: 0,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px 20px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '14px 20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#4a5568',
  },
  unit: {
    fontWeight: 400,
    color: '#a0aec0',
  },
  req: {
    color: '#e53e3e',
  },
  input: {
    border: '1px solid #cbd5e0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
  },
  select: {
    border: '1px solid #cbd5e0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    width: '100%',
    cursor: 'pointer',
  },
  btn: {
    marginTop: 8,
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
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
  resultValue: {
    fontSize: 40,
    fontWeight: 800,
    color: '#1a365d',
  },
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