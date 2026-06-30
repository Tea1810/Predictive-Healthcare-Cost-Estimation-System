import { FIELDS } from '../constants/fields.js'

export default function PatientForm({ form, set, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>

      <section style={s.section}>
        <div style={s.sliderRow}>
          <div style={s.sliderHeader}>
            <label style={s.label}>Age</label>
            <span style={s.sliderBadge}>{form.age} years</span>
          </div>
          <input
            className="mc-range"
            type="range"
            min={0}
            max={120}
            step={1}
            value={form.age}
            onChange={set('age')}
          />
          <div style={s.rangeEnds}>
            <span>0</span><span>120</span>
          </div>
        </div>

        <div style={s.grid2}>
          <div style={s.field}>
            <label style={s.label}>Gender</label>
            <div style={s.selectWrap}>
              <select style={s.select} className="mc-input" value={form.gender} onChange={set('gender')} required>
                <option value="0">Male</option>
                <option value="1">Female</option>
              </select>
              <span style={s.chevron}>&#8964;</span>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Smoking Status</label>
            <div style={s.selectWrap}>
              <select style={s.select} className="mc-input" value={form.is_smoker} onChange={set('is_smoker')} required>
                <option value="0">Non-smoker</option>
                <option value="1">Smoker</option>
              </select>
              <span style={s.chevron}>&#8964;</span>
            </div>
          </div>
        </div>

        <div style={s.sliderRow}>
          <div style={s.sliderHeader}>
            <label style={s.label}>Number of Conditions</label>
            <span style={s.sliderBadge}>{form.num_diseases}</span>
          </div>
          <input
            className="mc-range"
            type="range"
            min={0}
            max={50}
            step={1}
            value={form.num_diseases}
            onChange={set('num_diseases')}
          />
          <div style={s.rangeEnds}>
            <span>0</span><span>50</span>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Clinical Measurements</h2>
          <span style={s.optionalTag}>Optional</span>
        </div>
        <div style={s.grid3}>
          {FIELDS.optional.map(({ key, label, unit, step, placeholder }) => (
            <div key={key} style={s.field}>
              <label style={s.label}>
                {label}
                {unit && <span style={s.unit}> ({unit})</span>}
              </label>
              <input
                style={s.input}
                className="mc-input"
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
        className="mc-btn"
        disabled={loading}
      >
        {loading ? 'Estimating…' : 'Estimate Cost'}
      </button>
    </form>
  )
}

const s = {
  section: { marginBottom: 28 },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: '1px solid #eef1ef',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: '#0f1511',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: 700,
    color: '#059669',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '3px 10px',
    borderRadius: 999,
  },
  sliderRow: {
    marginBottom: 24,
  },
  sliderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sliderBadge: {
    fontSize: 13,
    fontWeight: 800,
    color: '#fff',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    boxShadow: '0 3px 10px rgba(16,185,129,0.35)',
    padding: '4px 12px',
    borderRadius: 999,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  rangeEnds: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#aab4ac',
    marginTop: 6,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px 24px',
    marginBottom: 24,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px 20px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: '#475247' },
  unit: { fontWeight: 400, color: '#aab4ac', fontSize: 12 },
  input: {
    border: '1.5px solid #e3e8e4',
    background: '#f6f8f6',
    borderRadius: 10,
    padding: '11px 13px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    color: '#0f1511',
    boxSizing: 'border-box',
  },
  selectWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    border: '1.5px solid #e3e8e4',
    background: '#f6f8f6',
    borderRadius: 10,
    padding: '11px 36px 11px 13px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    color: '#0f1511',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    fontSize: 18,
    color: '#8a958c',
    pointerEvents: 'none',
    lineHeight: 1,
  },
  btn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px -6px rgba(16,185,129,0.50)',
    letterSpacing: '0.1px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  btnDisabled: { opacity: 0.55, cursor: 'not-allowed', boxShadow: 'none' },
}
