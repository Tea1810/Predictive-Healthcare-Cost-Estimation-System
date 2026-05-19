import { FIELDS } from '../constants/fields.js'

export default function PatientForm({ form, set, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>

      {/* Primary fields */}
      <section style={s.section}>
        <div style={s.sliderRow}>
          <label style={s.label}>
            Age: <strong style={s.sliderVal}>{form.age} years</strong>
          </label>
          <input
            style={s.range}
            type="range"
            min={0}
            max={120}
            step={1}
            value={form.age}
            onChange={set('age')}
          />
        </div>

        <div style={s.grid2}>
          <div style={s.field}>
            <label style={s.label}>Gender</label>
            <div style={s.selectWrap}>
              <select style={s.select} value={form.gender} onChange={set('gender')} required>
                <option value="0">Male</option>
                <option value="1">Female</option>
              </select>
              <span style={s.chevron}>&#8964;</span>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Smoking Status</label>
            <div style={s.selectWrap}>
              <select style={s.select} value={form.is_smoker} onChange={set('is_smoker')} required>
                <option value="0">Non-smoker</option>
                <option value="1">Smoker</option>
              </select>
              <span style={s.chevron}>&#8964;</span>
            </div>
          </div>
        </div>

        <div style={s.sliderRow}>
          <label style={s.label}>
            Number of Conditions: <strong style={s.sliderVal}>{form.num_diseases}</strong>
          </label>
          <input
            style={s.range}
            type="range"
            min={0}
            max={50}
            step={1}
            value={form.num_diseases}
            onChange={set('num_diseases')}
          />
        </div>
      </section>

      {/* Optional clinical measurements */}
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
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },
  optional: {
    fontWeight: 400,
    textTransform: 'none',
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 0,
  },
  sliderRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px 24px',
    marginBottom: 20,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '14px 20px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: '#475569' },
  sliderVal: { color: '#0f172a', fontWeight: 700 },
  unit: { fontWeight: 400, color: '#94a3b8', fontSize: 12 },
  range: {
    width: '100%',
    accentColor: '#0f172a',
    cursor: 'pointer',
    height: 4,
  },
  input: {
    border: 'none',
    background: '#f1f5f9',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    color: '#1e293b',
    boxSizing: 'border-box',
  },
  selectWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    border: 'none',
    background: '#f1f5f9',
    borderRadius: 8,
    padding: '10px 36px 10px 12px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    color: '#1e293b',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    fontSize: 18,
    color: '#64748b',
    pointerEvents: 'none',
    lineHeight: 1,
  },
  btn: {
    marginTop: 8,
    width: '100%',
    padding: '14px',
    background: '#0f172a',
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
