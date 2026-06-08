import { useState } from 'react'
import PatientForm from './PatientForm.jsx'
import { downloadReport } from '../assets/api.js'

export default function Card({ form, set, loading, onSubmit, result, error, patientName }) {
  const [downloading, setDownloading] = useState(false)

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
        <div style={s.cardHeaderLeft}>
          <div style={s.headerIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h2 style={s.cardTitle}>Client Health Information</h2>
            <p style={s.cardSubtitle}>Enter patient data to generate a cost prediction</p>
          </div>
        </div>
      </div>

      <div style={s.cardBody}>
        <PatientForm form={form} set={set} loading={loading} onSubmit={onSubmit} />
      </div>

      {loading && (
        <>
          <style>{`@keyframes medicost_spin { to { transform: rotate(360deg) } }`}</style>
          <div style={s.loadingBox}>
            <div style={{ ...s.spinner, animation: 'medicost_spin 0.75s linear infinite' }} />
            <div>
              <div style={s.loadingTitle}>Analysing health data…</div>
              <div style={s.loadingText}>Generating your personalised cost estimate</div>
            </div>
          </div>
        </>
      )}

      {result !== null && (
        <div style={s.resultSection}>
          <div style={s.resultCard}>
            <div style={s.resultBadge}>Estimated Annual Cost</div>
            <div style={s.resultValue}>
              ${result.estimated_annual_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={s.resultNote}>This is a predictive estimate based on the entered health profile.</div>
          </div>
          <button style={s.downloadBtn} onClick={handleDownload} disabled={downloading}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {downloading ? 'Generating PDF…' : 'Download Full Report'}
          </button>
        </div>
      )}

      {error && (
        <div style={s.errorBox}>
          <strong>Error: </strong>{error}
        </div>
      )}
    </div>
  )
}

const s = {
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 14px rgba(0,60,30,0.08)',
    width: '100%',
    maxWidth: 860,
    overflow: 'hidden',
  },
  cardHeader: {
    background: '#004d29',
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  cardBody: {
    padding: '28px 32px',
  },
  loadingBox: {
    margin: '0 32px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: '#e8f5ee',
    border: '1.5px solid #b2dfc4',
    borderRadius: 10,
    padding: '18px 22px',
  },
  spinner: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: '3px solid #b2dfc4',
    borderTopColor: '#006838',
    flexShrink: 0,
  },
  loadingTitle: { fontSize: 14, color: '#006838', fontWeight: 700 },
  loadingText: { fontSize: 12, color: '#4a8a6a', marginTop: 2 },
  resultSection: {
    margin: '0 32px 28px',
  },
  resultCard: {
    background: '#e8f5ee',
    border: '1.5px solid #a8d8ba',
    borderRadius: 12,
    padding: '24px 28px',
    textAlign: 'center',
    marginBottom: 14,
  },
  resultBadge: {
    display: 'inline-block',
    background: '#006838',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 14px',
    borderRadius: 20,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 16,
  },
  resultValue: {
    fontSize: 44,
    fontWeight: 800,
    color: '#006838',
    lineHeight: 1,
    marginBottom: 10,
  },
  resultNote: {
    fontSize: 13,
    color: '#4a7a5a',
  },
  downloadBtn: {
    width: '100%',
    padding: '13px',
    background: '#fff',
    border: '1.5px solid #006838',
    color: '#006838',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  errorBox: {
    margin: '0 32px 28px',
    background: '#fff5f5',
    border: '1px solid #fcbcbc',
    borderRadius: 10,
    padding: '14px 18px',
    color: '#c53030',
    fontSize: 14,
  },
}
