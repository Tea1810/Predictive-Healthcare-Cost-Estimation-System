import { FIELDS } from '../constants/fields.js'

export default function PatientForm({ form, set, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
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

      <section style={s.section}>
        <h2 style={s.sectionTitle}>
          Clinical Measurements <span style={s.optional}>(optional)</span>
        </h2>
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

      <button
        type="submit"
        style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
        disabled={loading}
      >
        {loading ? 'Estimating...' : 'Estimate Cost'}
      </button>
    </form>
  )
}

const s = {
  section: { marginBottom: 28 },
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
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 13, fontWeight: 500, color: '#4a5568' },
  unit: { fontWeight: 400, color: '#a0aec0' },
  req: { color: '#e53e3e' },
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
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
}
