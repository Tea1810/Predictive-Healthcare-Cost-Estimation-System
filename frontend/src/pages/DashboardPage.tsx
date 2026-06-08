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

const API = '/api'

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

  useEffect(() => { load() }, [])

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.brand}>
            <div style={s.brandLogo}>
              <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                <polyline points="2,18 7,18 10,9 13,27 16,13 19,22 22,18 34,18"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={s.brandName}>MediCost</div>
              <div style={s.brandSub}>Analytics Dashboard</div>
            </div>
          </div>
          <div style={s.headerRight}>
            {lastUpdated && (
              <span style={s.updated}>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
            <a href="/" style={s.backBtn}>Go to Estimator</a>
          </div>
        </div>
      </header>

      <div style={s.heroBand}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>Aggregate Analytics</h1>
          <p style={s.heroSub}>Anonymised population-level statistics. No personal data is displayed.</p>
        </div>
      </div>


      <main style={s.main}>
        {error && (
          <div style={s.errorBox}>
            Could not load dashboard data: {error}
          </div>
        )}

        {!stats && !error && (
          <div style={s.loading}>
            <div style={s.loadingDot} />
            Loading statistics…
          </div>
        )}

        {stats && (
          <>
            <div style={s.sectionLabel}>This Month</div>
            <div style={s.grid2}>
              <StatCard label="Reports Generated" value={stats.reports_this_month.toString()}
                sub="patients assessed this month" accent="#006838" />
              <StatCard label="Average Estimated Cost" value={`$${fmt(stats.average_cost_this_month)}`}
                sub="per patient this month" accent="#00a550" />
            </div>

            <div style={s.sectionLabel}>Overall</div>
            <div style={s.grid3}>
              <StatCard label="Total Reports" value={stats.total_reports.toString()}
                sub="patients assessed overall" accent="#006838" />
              <StatCard label="Average Estimated Cost" value={`$${fmt(stats.average_cost)}`}
                sub="per patient overall" accent="#00a550" />
              <StatCard label="Smoker Rate" value={`${stats.smoker_percentage}%`}
                sub="of all assessed patients" accent="#d97706" />
            </div>

            <div style={s.sectionLabel}>High-Risk Patients</div>
            <div style={s.grid2}>
              <StatCard label="High-Risk Count" value={stats.high_risk_count.toString()}
                sub={`${stats.high_risk_percentage}% of all assessed patients`}
                accent="#dc2626"
                badge={`Above $${fmt(stats.high_risk_threshold)} threshold`} />
            </div>

            <div style={s.sectionLabel}>Age Group Distribution</div>
            <AgeChart groups={stats.age_groups}
              total={Object.values(stats.age_groups).reduce((a, b) => a + b, 0)} />
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, sub, accent, badge }: {
  label: string; value: string; sub: string; accent: string; badge?: string
}) {
  return (
    <div style={{ ...s.card, borderLeft: `4px solid ${accent}` }}>
      <div style={s.cardLabel}>{label}</div>
      <div style={{ ...s.cardValue, color: accent }}>{value}</div>
      <div style={s.cardSub}>{sub}</div>
      {badge && (
        <div style={{ ...s.badge, background: accent + '18', color: accent, borderColor: accent + '40' }}>
          {badge}
        </div>
      )}
    </div>
  )
}

function AgeChart({ groups, total }: { groups: Record<string, number>; total: number }) {
  const entries = Object.entries(groups)
  const max = Math.max(...entries.map(([, v]) => v), 1)
  const colors = ['#006838', '#006838', '#006838', '#006838']

  return (
    <div style={s.chartCard}>
      {entries.map(([label, count], i) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0
        const barWidth = Math.round((count / max) * 100)
        return (
          <div key={label} style={s.chartRow}>
            <div style={s.chartLabel}>{label}</div>
            <div style={s.barTrack}>
              <div style={{ ...s.bar, width: `${barWidth}%`, background: colors[i % colors.length] }} />
            </div>
            <div style={s.chartCount}>
              {count} <span style={s.chartPct}>({pct}%)</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f4f6f4',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: '#fff',
    borderBottom: '1.5px solid #dde3dd',
    boxShadow: '0 1px 4px rgba(0,60,30,0.06)',
  },
  headerInner: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 14 },
  brandLogo: {
    width: 40, height: 40, borderRadius: 10,
    background: '#006838',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  brandName: { fontSize: 17, fontWeight: 800, color: '#1a1f1a', lineHeight: 1.2 },
  brandSub: { fontSize: 12, color: '#7a8a7a', marginTop: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  updated: { fontSize: 12, color: '#9aaa9a' },
  refreshBtn: {
    padding: '7px 16px', borderRadius: 7,
    background: '#e8f5ee', border: '1.5px solid #b2dfc4',
    color: '#006838', fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  backBtn: {
    padding: '7px 16px', borderRadius: 7,
    background: '#006838', border: 'none',
    color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none',
  },
  heroBand: {
    background: '#004d29',
    padding: '28px 0',
  },
  heroInner: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '0 32px',
  },
  heroTitle: {
    fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6,
  },
  heroSub: {
    fontSize: 14, color: 'rgba(255,255,255,0.75)',
  },
  main: {
    flex: 1,
    maxWidth: 1160,
    margin: '0 auto',
    padding: '36px 32px',
    width: '100%',
    boxSizing: 'border-box',
  },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase',
    letterSpacing: '0.1em', marginBottom: 14, marginTop: 32,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
    maxWidth: 720,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 6px rgba(0,60,30,0.07)',
    padding: '22px 26px',
  },
  cardLabel: {
    fontSize: 12, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  cardValue: { fontSize: 38, fontWeight: 800, lineHeight: 1, marginBottom: 8 },
  cardSub: { fontSize: 13, color: '#7a8a7a' },
  badge: {
    display: 'inline-block', marginTop: 12,
    padding: '4px 12px', borderRadius: 20,
    fontSize: 11, fontWeight: 700, border: '1px solid transparent',
  },
  chartCard: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 6px rgba(0,60,30,0.07)',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  chartRow: { display: 'flex', alignItems: 'center', gap: 16 },
  chartLabel: { width: 56, fontSize: 13, fontWeight: 600, color: '#4a5a4a', textAlign: 'right' as const },
  barTrack: { flex: 1, height: 30, background: '#f4f6f4', borderRadius: 6, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 6, transition: 'width 0.4s ease' },
  chartCount: { width: 90, fontSize: 13, fontWeight: 600, color: '#4a5a4a' },
  chartPct: { fontWeight: 600, color: '#4a5a4a' },
  loading: {
    display: 'flex', alignItems: 'center', gap: 12,
    textAlign: 'center', padding: '80px 0', color: '#9aaa9a', fontSize: 15, justifyContent: 'center',
  },
  loadingDot: {
    width: 16, height: 16, borderRadius: '50%',
    border: '3px solid #dde3dd', borderTopColor: '#006838',
    animation: 'spin 0.75s linear infinite',
  },
  errorBox: {
    background: '#fff5f5', border: '1px solid #fcbcbc', borderRadius: 10,
    padding: '14px 18px', color: '#c53030', fontSize: 14, marginBottom: 24,
  },
  footer: {
    background: '#fff',
    borderTop: '1.5px solid #dde3dd',
  },
  footerInner: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '18px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  footerBrand: {
    fontSize: 13, fontWeight: 800, color: '#006838',
  },
  footerText: {
    fontSize: 12, color: '#9aaa9a',
  },
}
