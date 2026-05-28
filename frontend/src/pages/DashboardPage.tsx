import { useEffect, useState } from 'react'

type Stats = {
  total_reports: number
  reports_this_month: number
  average_cost_this_month: number
  average_cost: number
  smoker_percentage: number
  high_risk_threshold: number
  high_risk_count: number
  high_risk_percentage: number
  age_groups: Record<string, number>
}

const API = 'http://127.0.0.1:8000'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function load() {
    try {
      const res = await fetch(`${API}/dashboard`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setStats(await res.json())
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                <polyline points="2,18 7,18 10,9 13,27 16,13 19,22 22,18 34,18"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={s.logoTitle}>Healthcare Cost Estimator</div>
              <div style={s.logoSub}>Public Analytics Dashboard</div>
            </div>
          </div>
          {lastUpdated && (
            <div style={s.updated}>
              Updated {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </header>

      <main style={s.main}>
        {error && (
          <div style={s.errorBox}>
            Could not load dashboard data: {error}
          </div>
        )}

        {!stats && !error && (
          <div style={s.loading}>Loading statistics…</div>
        )}

        {stats && (
          <>
            <section style={s.section}>
              <h2 style={s.sectionTitle}>This Month</h2>
              <div style={s.grid2}>
                <StatCard
                  label="Reports Generated"
                  value={stats.reports_this_month.toString()}
                  sub="patients assessed this month"
                  color="#6c63ff"
                />
                <StatCard
                  label="Average Estimated Cost"
                  value={`$${fmt(stats.average_cost_this_month)}`}
                  sub="per patient this month"
                  color="#38a169"
                />
              </div>
            </section>

            <section style={s.section}>
              <h2 style={s.sectionTitle}>Overall</h2>
              <div style={s.grid3}>
                <StatCard
                  label="Total Reports"
                  value={stats.total_reports.toString()}
                  sub="patients assessed overall"
                  color="#3182ce"
                />
                <StatCard
                  label="Average Estimated Cost"
                  value={`$${fmt(stats.average_cost)}`}
                  sub="per patient overall"
                  color="#3182ce"
                />
                <StatCard
                  label="Smoker Rate"
                  value={`${stats.smoker_percentage}%`}
                  sub="of all assessed patients are smokers"
                  color="#d69e2e"
                />
              </div>
            </section>

            <section style={s.section}>
              <h2 style={s.sectionTitle}>High-Risk Patients (Overall)</h2>
              <div style={s.grid2}>
                <StatCard
                  label="High-Risk Count"
                  value={stats.high_risk_count.toString()}
                  sub={`${stats.high_risk_percentage}% of all assessed patients`}
                  color="#e53e3e"
                  badge={`above $${fmt(stats.high_risk_threshold)} threshold`}
                />
              </div>
            </section>

            <section style={s.section}>
              <h2 style={s.sectionTitle}>Age Group Distribution</h2>
              <AgeChart groups={stats.age_groups} total={Object.values(stats.age_groups).reduce((a, b) => a + b, 0)} />
            </section>
          </>
        )}
      </main>

      <footer style={s.footer}>
        This dashboard displays anonymised aggregate statistics only. No personal data is shown.
      </footer>
    </div>
  )
}

function StatCard({
  label, value, sub, color, badge,
}: {
  label: string; value: string; sub: string; color: string; badge?: string
}) {
  return (
    <div style={{ ...s.card, borderTop: `4px solid ${color}` }}>
      <div style={s.cardLabel}>{label}</div>
      <div style={{ ...s.cardValue, color }}>{value}</div>
      <div style={s.cardSub}>{sub}</div>
      {badge && <div style={{ ...s.badge, background: color + '18', color }}>{badge}</div>}
    </div>
  )
}

function AgeChart({ groups, total }: { groups: Record<string, number>; total: number }) {
  const entries = Object.entries(groups)
  const max = Math.max(...entries.map(([, v]) => v), 1)
  const colors = ['#6c63ff', '#3182ce', '#38a169', '#d69e2e']

  return (
    <div style={s.card}>
      <div style={s.chartGrid}>
        {entries.map(([label, count], i) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          const barWidth = Math.round((count / max) * 100)
          return (
            <div key={label} style={s.chartRow}>
              <div style={s.chartLabel}>{label}</div>
              <div style={s.barTrack}>
                <div style={{ ...s.bar, width: `${barWidth}%`, background: colors[i % colors.length] }} />
              </div>
              <div style={s.chartCount}>{count} <span style={s.chartPct}>({pct}%)</span></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 14 },
  logoIcon: {
    width: 42, height: 42, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff 0%, #5a52e0 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoTitle: { fontSize: 17, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 },
  logoSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  updated: { fontSize: 12, color: '#94a3b8' },
  main: {
    flex: 1,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 24px',
    width: '100%',
    boxSizing: 'border-box',
  },
  section: { marginBottom: 36 },
  sectionTitle: {
    fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.07em', marginBottom: 16,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
    maxWidth: 700,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    padding: '24px 28px',
  },
  cardLabel: { fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
  cardValue: { fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 8 },
  cardSub: { fontSize: 13, color: '#64748b' },
  badge: {
    display: 'inline-block',
    marginTop: 10,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  chartGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  chartRow: { display: 'flex', alignItems: 'center', gap: 12 },
  chartLabel: { width: 54, fontSize: 13, fontWeight: 600, color: '#475569', textAlign: 'right' as const },
  barTrack: { flex: 1, height: 28, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 6, transition: 'width 0.4s ease' },
  chartCount: { width: 80, fontSize: 13, fontWeight: 700, color: '#0f172a' },
  chartPct: { fontWeight: 400, color: '#94a3b8' },
  loading: { textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 15 },
  errorBox: {
    background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 10,
    padding: '14px 18px', color: '#c53030', fontSize: 14, marginBottom: 24,
  },
  footer: {
    textAlign: 'center',
    padding: '20px 16px',
    fontSize: 12,
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
  },
}