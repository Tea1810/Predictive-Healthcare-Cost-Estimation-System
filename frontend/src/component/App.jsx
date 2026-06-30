import { useRef, useState } from 'react'
import Icon from '../components/Icon.tsx'
import PatientForm from './PatientForm.jsx'
import { downloadReport } from '../assets/api.js'

export default function Card({
  form, set, loading, onSubmit, result, error, patientName,
  csvRows, csvIndex, onCsvLoad, onCsvPrev, onCsvNext,
}) {
  const [downloading, setDownloading] = useState(false)
  const fileRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onCsvLoad(file)
    e.target.value = ''
  }

  const hasCsv = csvRows.length > 0
  const showLeft = hasCsv && csvIndex > 0
  const showRight = hasCsv && csvIndex < csvRows.length - 1

  const handleDownload = async () => {
    if (!result) return
    setDownloading(true)
    try {
      await downloadReport({
        estimated_annual_cost: result.estimated_annual_cost,
        contributions: result.contributions,
        report: result.report,
        patient_name: patientName ?? '',
        patient: {
          age: parseInt(form.age),
          gender: parseInt(form.gender),
          is_smoker: parseInt(form.is_smoker),
          num_diseases: parseInt(form.num_diseases),
        },
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={s.cardHeaderGlow} />
        <div style={s.cardHeaderLeft}>
          <div style={s.headerIcon}>
            <Icon name="user" size={18} color="white" />
          </div>
          <div>
            <h2 style={s.cardTitle}>Client Health Information</h2>
            <p style={s.cardSubtitle}>Enter patient data to generate a cost prediction</p>
          </div>
        </div>

        <div style={s.csvControls}>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button style={s.csvBtn} className="mc-btn-ghost" onClick={() => fileRef.current?.click()}>
            <Icon name="download" size={14} style={{ marginRight: 6 }} />
            {hasCsv ? 'Replace CSV' : 'Import CSV'}
          </button>

          {hasCsv && (
            <div style={s.navRow}>
              <button
                style={{ ...s.navBtn, ...(showLeft ? {} : s.navBtnHidden) }}
                className="mc-iconbtn"
                onClick={onCsvPrev}
                disabled={!showLeft}
                aria-label="Previous row"
              >
                &#8592;
              </button>
              <span style={s.navCounter}>
                Row {csvIndex + 1} of {csvRows.length}
              </span>
              <button
                style={{ ...s.navBtn, ...(showRight ? {} : s.navBtnHidden) }}
                className="mc-iconbtn"
                onClick={onCsvNext}
                disabled={!showRight}
                aria-label="Next row"
              >
                &#8594;
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={s.cardBody}>
        <PatientForm form={form} set={set} loading={loading} onSubmit={onSubmit} />
      </div>

      {loading && (
        <div style={s.loadingBox} className="mc-fade-up">
          <div style={{ ...s.spinner, animation: 'mc_spin 0.75s linear infinite' }} />
          <div>
            <div style={s.loadingTitle}>Analysing health data…</div>
            <div style={s.loadingText}>Generating your personalised cost estimate</div>
          </div>
        </div>
      )}

      {result !== null && (
        <div style={s.resultSection} className="mc-fade-up">
          <div style={s.resultCard}>
            <div style={s.resultGlow} />
            <div style={s.resultBadge}>Estimated Annual Cost</div>
            <div style={s.resultValue}>
              ${result.estimated_annual_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={s.resultNote}>This is a predictive estimate based on the entered health profile.</div>
          </div>
          <button style={s.downloadBtn} className="mc-btn-outline" onClick={handleDownload} disabled={downloading}>
            <Icon name="download" size={15} style={{ marginRight: 8 }} />
            {downloading ? 'Generating PDF…' : 'Download Full Report'}
          </button>
        </div>
      )}

      {error && (
        <div style={s.errorBox} className="mc-fade-up">
          <strong>Error: </strong>{error}
        </div>
      )}
    </div>
  )
}

const s = {
  card: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 24px 48px -16px rgba(15,21,17,0.22), 0 8px 18px -10px rgba(15,21,17,0.12)',
    border: '1px solid #eef1ef',
    width: '100%',
    maxWidth: 860,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0f1511 0%, #15241c 60%, #0a2c1e 100%)',
    padding: '22px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  cardHeaderGlow: {
    position: 'absolute', top: -90, right: -40, width: 260, height: 260,
    background: 'radial-gradient(circle, rgba(16,185,129,0.30), transparent 65%)',
    pointerEvents: 'none',
  },
  cardHeaderLeft: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 42, height: 42, borderRadius: 12,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    boxShadow: '0 6px 16px rgba(16,185,129,0.40)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 2, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' },
  cardSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.60)' },

  csvControls: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  csvBtn: {
    display: 'flex', alignItems: 'center',
    padding: '8px 14px', borderRadius: 9,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    width: 34, height: 34, borderRadius: 9,
    background: 'rgba(16,185,129,0.18)',
    border: '1px solid rgba(16,185,129,0.40)',
    color: '#6ee7b7', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  navBtnHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  navCounter: {
    fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)',
    minWidth: 84, textAlign: 'center',
  },

  cardBody: { padding: '28px 32px' },
  loadingBox: {
    margin: '0 32px 28px',
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'var(--emerald-soft)', border: '1px solid var(--emerald-border)',
    borderRadius: 14, padding: '18px 22px',
  },
  spinner: {
    width: 22, height: 22, borderRadius: '50%',
    border: '3px solid #a7f3d0', borderTopColor: '#059669', flexShrink: 0,
  },
  loadingTitle: { fontSize: 14, color: '#047857', fontWeight: 700 },
  loadingText: { fontSize: 12, color: '#059669', marginTop: 2 },
  resultSection: { margin: '0 32px 28px' },
  resultCard: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0f1511 0%, #103024 100%)',
    border: '1px solid rgba(16,185,129,0.30)',
    boxShadow: '0 16px 36px -14px rgba(16,185,129,0.30)',
    borderRadius: 16, padding: '30px 28px', textAlign: 'center', marginBottom: 14,
    overflow: 'hidden',
  },
  resultGlow: {
    position: 'absolute', bottom: -110, left: '50%', transform: 'translateX(-50%)',
    width: 320, height: 220,
    background: 'radial-gradient(circle, rgba(16,185,129,0.30), transparent 68%)',
    pointerEvents: 'none',
  },
  resultBadge: {
    position: 'relative',
    display: 'inline-block',
    background: 'rgba(16,185,129,0.16)', color: '#6ee7b7',
    border: '1px solid rgba(16,185,129,0.35)',
    fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
  },
  resultValue: {
    position: 'relative',
    fontSize: 48, fontWeight: 800, lineHeight: 1, marginBottom: 10,
    fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em',
    background: 'linear-gradient(135deg, #ffffff, #6ee7b7)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  resultNote: { position: 'relative', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  downloadBtn: {
    width: '100%', padding: '14px',
    background: '#fff', border: '1.5px solid var(--emerald)', color: 'var(--emerald-deep)',
    borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  errorBox: {
    margin: '0 32px 28px', background: '#fef2f2',
    border: '1px solid #fecaca', borderRadius: 12,
    padding: '14px 18px', color: '#b91c1c', fontSize: 14,
  },
}
