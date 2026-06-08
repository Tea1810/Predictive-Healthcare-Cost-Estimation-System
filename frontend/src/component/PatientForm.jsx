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
            style={s.range}
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
          <div style={s.sliderHeader}>
            <label style={s.label}>Number of Conditions</label>
            <span style={s.sliderBadge}>{form.num_diseases}</span>
          </div>
          <input
            style={s.range}
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
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: '1.5px solid #edf2ed',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1f1a',
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: 600,
    color: '#006838',
    background: '#e8f5ee',
    border: '1px solid #b2dfc4',
    padding: '2px 9px',
    borderRadius: 12,
  },
  sliderRow: {
    marginBottom: 22,
  },
  sliderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderBadge: {
    fontSize: 13,
    fontWeight: 700,
    color: '#006838',
    background: '#e8f5ee',
    border: '1px solid #b2dfc4',
    padding: '2px 10px',
    borderRadius: 12,
  },
  rangeEnds: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#9aaa9a',
    marginTop: 4,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px 24px',
    marginBottom: 22,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '14px 20px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#4a5a4a' },
  unit: { fontWeight: 400, color: '#9aaa9a', fontSize: 12 },
  range: {
    width: '100%',
    accentColor: '#006838',
    cursor: 'pointer',
    height: 4,
  },
  input: {
    border: '1.5px solid #dde3dd',
    background: '#fff',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    color: '#1a1f1a',
    boxSizing: 'border-box',
  },
  selectWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    border: '1.5px solid #dde3dd',
    background: '#fff',
    borderRadius: 8,
    padding: '10px 36px 10px 12px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    color: '#1a1f1a',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    fontSize: 18,
    color: '#7a8a7a',
    pointerEvents: 'none',
    lineHeight: 1,
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: '#006838',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s',
    letterSpacing: '0.1px',
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
}
