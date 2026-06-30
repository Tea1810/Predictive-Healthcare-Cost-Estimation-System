import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAuth } from '../../auth/AuthContext'
import Sidebar from '../../../shared/ui/Sidebar'
import { C } from '../../../shared/styles/tokens'
import { usd } from '../../../shared/styles/format'
import { listReports, renameReport, openReportPdf } from '../api'
import type { Report } from '../types'

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—'

export default function ReportsPage() {
  const { logout } = useAuth()
  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [saving, setSaving] = useState(false)

  async function openPdf(r: Report) {
    try {
      await openReportPdf(r.id)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function load() {
    try {
      setReports(await listReports())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }
  useEffect(() => { load() }, [])

  function startEdit(r: Report) {
    setEditingId(r.id)
    setDraftName(r.name)
  }
  function cancelEdit() {
    setEditingId(null)
    setDraftName('')
  }
  async function saveEdit(r: Report) {
    const name = draftName.trim()
    if (!name || name === r.name) { cancelEdit(); return }
    setSaving(true)
    try {
      await renameReport(r.id, name)
      setReports((rs) => rs ? rs.map((x) => (x.id === r.id ? { ...x, name } : x)) : rs)
      cancelEdit()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.shell}>
      <Sidebar subtitle="Reports" onSignOut={logout} />
      <main style={s.main}>
        <div style={s.header}>
          <div style={s.eyebrow}>Saved reports</div>
          <h1 style={s.title}>Your reports</h1>
          <p style={s.sub}>Every estimate you generate is saved here, newest first.</p>
        </div>

        {error && <div style={s.errorBox}>Could not load reports: {error}</div>}
        {!reports && !error && (
          <div style={s.loading}><span style={s.dot} /> Loading reports…</div>
        )}
        {reports && reports.length === 0 && (
          <div style={s.empty}>No reports yet. Generate an estimate and it will appear here.</div>
        )}

        {reports && reports.length > 0 && (
          <div style={s.list}>
            {reports.map((r) => (
              <div key={r.id} style={s.row} className="mc-card">
                <div style={s.rowLeft}>
                  {editingId === r.id ? (
                    <div style={s.editRow}>
                      <input
                        autoFocus
                        className="mc-input"
                        style={s.input}
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(r)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                      />
                      <button style={s.btnPrimary} className="mc-btn" disabled={saving} onClick={() => saveEdit(r)}>
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button style={s.btnGhost} onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div style={s.name}>{r.name}</div>
                      <div style={s.meta}>{fmtDate(r.created_at)}</div>
                    </>
                  )}
                </div>
                {editingId !== r.id && (
                  <div style={s.rowRight}>
                    <div style={s.cost}>{usd(r.cost)}</div>
                    <button style={s.action} onClick={() => openPdf(r)}>View</button>
                    <button style={s.action} onClick={() => startEdit(r)}>Rename</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const s: Record<string, CSSProperties> = {
  shell: { minHeight: '100vh', display: 'flex', background: C.pageBg },
  main: { flex: 1, minWidth: 0, padding: '40px 32px 56px', maxWidth: 920, width: '100%', boxSizing: 'border-box' },

  header: { marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.navy },
  title: { fontSize: 26, fontWeight: 700, color: C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', marginTop: 4 },
  sub: { fontSize: 13.5, color: C.muted, marginTop: 4 },

  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16, flexWrap: 'wrap',
  },
  rowLeft: { minWidth: 0, flex: 1 },
  name: { fontSize: 15.5, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { fontSize: 12.5, color: C.muted, marginTop: 3 },
  rowRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  cost: { fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: "'Plus Jakarta Sans', sans-serif", marginRight: 4 },
  action: {
    padding: '8px 14px', borderRadius: 9, border: `1px solid ${C.border}`,
    background: '#fff', color: C.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },

  editRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  input: {
    flex: 1, minWidth: 200, padding: '9px 12px', borderRadius: 9,
    border: `1.5px solid ${C.border}`, fontSize: 14, color: C.ink, background: '#f6f8f6',
  },
  btnPrimary: {
    padding: '9px 16px', borderRadius: 9, border: 'none', background: C.navy,
    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  btnGhost: {
    padding: '9px 14px', borderRadius: 9, border: `1px solid ${C.border}`,
    background: '#fff', color: C.mid, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },

  loading: { display: 'flex', alignItems: 'center', gap: 12, padding: '60px 0', color: C.muted, fontSize: 15 },
  dot: { width: 16, height: 16, borderRadius: '50%', border: '3px solid #D2F1DA', borderTopColor: C.navy, animation: 'mc_spin 0.75s linear infinite' },
  empty: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: '48px 20px', textAlign: 'center', color: C.muted, fontSize: 14,
  },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', color: '#b91c1c', fontSize: 14, marginBottom: 18 },
}
