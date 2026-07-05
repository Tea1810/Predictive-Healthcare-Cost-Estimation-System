import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import Sidebar from '../../../shared/ui/Sidebar'
import { C, TIER } from '../../../shared/styles/tokens'
import { usd, usdCompact, count, pct1 } from '../../../shared/styles/format'
import { getDashboardStats } from '../api'
import type { Stats } from '../types'


export default function DashboardPage() {
  const { logout } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      setStats(await getDashboardStats())
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={s.shell}>
      <Sidebar subtitle="Analytics" onSignOut={logout} />
      <div style={s.body}>
        <Topbar lastUpdated={lastUpdated} loading={loading} onRefresh={load} />
        <main style={s.main}>
          {error && <div style={s.errorBox}>Could not load dashboard data: {error}</div>}
          {!stats && !error && (
            <div style={s.loading}><div style={s.loadingDot} /> Loading analytics…</div>
          )}
          {stats && <DashboardContent stats={stats} />}
        </main>
      </div>
    </div>
  )
}

function DashboardContent({ stats }: { stats: Stats }) {
  return (
    <div className="mc-fade-up">
      <div className="mc-dash-kpis">
        <CostExposureCard
          total={stats.total_predicted_cost}
          momPct={stats.mom_pct}
        />
        <KpiCard
          label="Avg cost / patient"
          value={usd(stats.average_cost)}
          foot={`cumulative to date`}
        />
        <KpiCard
          label="Patients assessed"
          value={count(stats.total_patients)}
          foot={`across all reports`}
        />
        <ReportsThisMonthCard
          thisMonth={stats.reports_this_month}
          lastMonth={stats.reports_last_month}
        />
      </div>

      <div className="mc-dash-row">
        <Card
          title="Patients by cost tiers"
          subtitle={`Monthly counts`}
        >
          <TierByMonth data={stats.tier_by_month} />
        </Card>
        <Card title="Cost concentration" subtitle="Top 10% of patients by cost">
          <ConcentrationDonut share={stats.top_decile_cost_share} />
        </Card>
      </div>

      <div className="mc-dash-row">
        <Card
          title="Total cost in the last 2 months"
          subtitle={`Weekly cost from logged reports`}
        >
          <WeeklyArea
            thisMonth={stats.weekly_this_month}
            lastMonth={stats.weekly_last_month}
          />
        </Card>
        <Card title="Cost by age" subtitle={`Avg ${stats.cost_basis} cost / patient`}>
          <CostByAge bands={stats.cost_by_age} />
        </Card>
      </div>
    </div>
  )
}

function Topbar({ lastUpdated, loading, onRefresh }: {
  lastUpdated: Date | null; loading: boolean; onRefresh: () => void
}) {
  return (
    <header style={s.topbar}>
      <div>
        <div style={s.topEyebrow}>Population insights</div>
        <h1 style={s.topTitle}>Cost overview</h1>
      </div>
      <div style={s.topRight}>
        {lastUpdated && (
          <span style={s.updated}>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        )}
        <button onClick={onRefresh} style={s.refreshBtn} className="mc-btn" disabled={loading}>
          <span style={{ display: 'inline-block', animation: loading ? 'mc_spin 0.8s linear infinite' : undefined }}>↻</span>
          Refresh
        </button>
      </div>
    </header>
  )
}

function CostExposureCard({ total, momPct }: {
  total: number; momPct: number | null
}) {
  const up = (momPct ?? 0) >= 0
  return (
    <div style={s.heroCard}>
      <div style={s.heroLabel}>Cost exposure</div>
      <div style={s.heroValue}>{usdCompact(total)}</div>
      <div style={s.heroFootRow}>
        {momPct !== null ? (
          <span style={{ ...s.momChip, background: up ? 'rgba(229,72,77,0.16)' : 'rgba(42,128,73,0.16)', color: up ? C.red : C.navy }}>
            {up ? '▲' : '▼'} {pct1(Math.abs(momPct))} {up ? 'higher' : 'lower'} than last month
          </span>
        ) : (
          <span style={s.heroNoTrend}>No prior month to compare</span>
        )}
        <span style={s.heroBasis}>From all assessed patients</span>
      </div>
    </div>
  )
}

function KpiCard({ label, value, foot }: { label: string; value: string; foot: string }) {
  return (
    <div style={s.kpiCard} className="mc-card">
      <div style={s.kpiLabel}>{label}</div>
      <div style={s.kpiValue}>{value}</div>
      <div style={s.kpiFoot}>{foot}</div>
    </div>
  )
}

function ReportsThisMonthCard({ thisMonth, lastMonth }: {
  thisMonth: number; lastMonth: number
}) {
  // Month-over-month change in report count, as a percentage of last month.
  const pctChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null
  const up = (pctChange ?? 0) >= 0
  return (
    <div style={s.kpiCard} className="mc-card">
      <div style={s.kpiLabel}>Reports this month</div>
      <div style={s.kpiValue}>{count(thisMonth)}</div>
      {pctChange !== null ? (
        <div style={{ ...s.kpiFoot, color: up ? C.navy : C.red, fontWeight: 600 }}>
          {up ? '▲' : '▼'} {pct1(Math.abs(pctChange))} vs last month
        </div>
      ) : (
        <div style={s.kpiFoot}>no reports last month</div>
      )}
    </div>
  )
}
function Card({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode
}) {
  return (
    <div style={s.card} className="mc-card">
      <div style={s.cardHead}>
        <div style={s.cardTitle}>{title}</div>
        {subtitle && <div style={s.cardSub}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div style={s.empty}>{text}</div>
}

/* -------------------------- Row 2a — tier bars --------------------------- */

function TierByMonth({ data }: { data: Stats['tier_by_month'] }) {
  if (data.length === 0) {
    return <EmptyState text="No logged reports yet to break down by month." />
  }
  // Grouped (not stacked) — each tier is its own rectangle, scaled to the
  // largest single-tier count so heights are comparable across tiers/months.
  const max = Math.max(...data.flatMap((d) => [d.high, d.med, d.low]), 1)
  const h = 200
  const barH = (v: number) => Math.max(v > 0 ? 3 : 0, Math.round((v / max) * (h - 40)))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: h, padding: '8px 4px 0' }}>
        {data.map((d) => {
          const tiers = [
            { key: 'high', label: 'High cost', value: d.high, color: TIER.high },
            { key: 'med', label: 'Medium cost', value: d.med, color: TIER.med },
            { key: 'low', label: 'Low cost', value: d.low, color: TIER.low },
          ]
          return (
            <div key={d.month} style={s.barCol}>
              <div style={s.barGroup}>
                {tiers.map((t) => (
                  <div key={t.key} style={s.barItem} title={`${d.label} · ${t.label}: ${count(t.value)} patients`}>
                    <div style={s.barTotal}>{count(t.value)}</div>
                    <div style={{ ...s.barRect, height: barH(t.value), background: t.color }} />
                  </div>
                ))}
              </div>
              <div style={s.barLabel}>{d.label}</div>
            </div>
          )
        })}
      </div>
      <Legend
        items={[
          { label: 'High cost', color: TIER.high },
          { label: 'Medium cost', color: TIER.med },
          { label: 'Low cost', color: TIER.low },
        ]}
      />
    </div>
  )
}

/* ----------------------- Row 2b — concentration -------------------------- */

function ConcentrationDonut({ share }: { share: number }) {
  const size = 176, stroke = 22, r = (size - stroke) / 2, circ = 2 * Math.PI * r
  const len = (Math.min(100, share) / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.navy} strokeWidth={stroke}
          strokeDasharray={`${len} ${circ - len}`} strokeLinecap="round" />
        <text x="50%" y="46%" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 30, fontWeight: 700, fill: C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {pct1(share)}
        </text>
        <text x="50%" y="59%" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 11, fill: C.muted }}>
          of total cost
        </text>
      </svg>
      <div style={s.donutCaption}>
        The most expensive 10% of patients account for {pct1(share)} of overall registered cost.
      </div>
    </div>
  )
}

function WeeklyArea({ thisMonth, lastMonth }: {
  thisMonth: { week: number; cost: number }[]
  lastMonth: { week: number; cost: number }[]
}) {
  const allZero = [...thisMonth, ...lastMonth].every((p) => p.cost === 0)
  if (allZero) {
    return <EmptyState text="No weekly cost logged for this month or last month yet." />
  }

  const w = 520, h = 200, padX = 8, padTop = 16, padBottom = 28
  const weeks = [1, 2, 3, 4]
  const max = Math.max(...thisMonth.map((p) => p.cost), ...lastMonth.map((p) => p.cost), 1)
  const x = (week: number) => padX + ((week - 1) / (weeks.length - 1)) * (w - padX * 2)
  const y = (cost: number) => padTop + (1 - cost / max) * (h - padTop - padBottom)

  const smooth = (pts: readonly (readonly [number, number])[]) => {
    if (pts.length < 2) return ''
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] ?? p2
      const c1x = p1[0] + (p2[0] - p0[0]) / 6
      const c1y = p1[1] + (p2[1] - p0[1]) / 6
      const c2x = p2[0] - (p3[0] - p1[0]) / 6
      const c2y = p2[1] - (p3[1] - p1[1]) / 6
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
    }
    return d
  }

  const series = (data: { week: number; cost: number }[]) => {
    const pts = weeks.map((wk) => {
      const found = data.find((p) => p.week === wk)
      return [x(wk), y(found ? found.cost : 0)] as const
    })
    const line = smooth(pts)
    const area = `${line} L${x(weeks[weeks.length - 1])},${h - padBottom} L${x(weeks[0])},${h - padBottom} Z`
    return { line, area }
  }
  const last = series(lastMonth)
  const cur = series(thisMonth)

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <path d={last.area} fill={C.orange} fillOpacity={0.14} />
        <path d={last.line} fill="none" stroke={C.orange} strokeWidth={2.5} strokeLinejoin="round" />
        <path d={cur.area} fill={C.navy} fillOpacity={0.14} />
        <path d={cur.line} fill="none" stroke={C.navy} strokeWidth={2.5} strokeLinejoin="round" />
        {weeks.map((wk) => (
          <text key={wk} x={x(wk)} y={h - 8} textAnchor="middle" style={{ fontSize: 11, fill: C.muted }}>W{wk}</text>
        ))}
      </svg>
      <Legend
        items={[
          { label: 'This month', color: C.navy },
          { label: 'Last month', color: C.orange },
        ]}
      />
    </div>
  )
}

function CostByAge({ bands }: { bands: Stats['cost_by_age'] }) {
  const max = Math.max(...bands.map((b) => b.avg_cost), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 6 }}>
      {bands.map((b) => (
        <div key={b.band}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.mid }}>{b.band}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{usd(b.avg_cost)}</span>
          </div>
          <div style={s.hTrack}>
            <div style={{ height: '100%', borderRadius: 999, width: `${(b.avg_cost / max) * 100}%`, background: C.navy, transition: 'width .6s cubic-bezier(.2,.7,.2,1)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------- Legend --------------------------------- */

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 16, justifyContent: 'center' }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: it.color }} />
          <span style={{ fontSize: 12.5, color: C.mid, fontWeight: 500 }}>{it.label}</span>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------- Styles --------------------------------- */

const s: Record<string, React.CSSProperties> = {
  shell: { minHeight: '100vh', display: 'flex', background: C.pageBg },

  body: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    padding: '24px 30px 18px', flexWrap: 'wrap',
  },
  topEyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.navy },
  topTitle: { fontSize: 25, fontWeight: 600, color: C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', marginTop: 4 },
  topRight: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  updated: { fontSize: 12, color: C.muted },
  refreshBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px', borderRadius: 10,
    background: C.navy, color: '#fff', border: 'none', fontWeight: 500,
    fontSize: 14, cursor: 'pointer',
  },

  main: { flex: 1, padding: '0 30px 36px', width: '100%', boxSizing: 'border-box' },

  /* KPI cards */
  heroCard: {
    background: C.dark, borderRadius: 16, padding: 20, color: '#fff',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  },
  heroLabel: { fontSize: 13, color: C.sidebarText, fontWeight: 500 },
  heroValue: { fontSize: 32, fontWeight: 700, marginTop: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', lineHeight: 1 },
  heroFootRow: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 },
  momChip: { alignSelf: 'flex-start', fontSize: 12.5, fontWeight: 600, padding: '3px 9px', borderRadius: 999 },
  heroNoTrend: { fontSize: 12, color: C.sidebarText },
  heroBasis: { fontSize: 11.5, color: 'rgba(210,241,218,0.70)' },

  kpiCard: {
    background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20,
    display: 'flex', flexDirection: 'column',
  },
  kpiLabel: { fontSize: 13, color: C.muted, fontWeight: 500 },
  kpiValue: { fontSize: 30, fontWeight: 700, color: C.ink, marginTop: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', lineHeight: 1 },
  kpiFoot: { fontSize: 12.5, color: C.muted, marginTop: 12 },
  kpiSubFoot: { fontSize: 11.5, color: C.muted, marginTop: 3 },

  /* Cards */
  card: {
    background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 22,
    minWidth: 0,
  },
  cardHead: { marginBottom: 16 },
  cardTitle: { fontSize: 15.5, fontWeight: 600, color: C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em' },
  cardSub: { fontSize: 12.5, color: C.muted, marginTop: 3 },

  /* Tier bars */
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0 },
  barGroup: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, width: '100%' },
  barItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, maxWidth: 26 },
  barTotal: { fontSize: 12, fontWeight: 600, color: C.ink },
  barRect: {
    width: '100%', borderRadius: 6,
    transition: 'height .6s cubic-bezier(.2,.7,.2,1)',
  },
  barLabel: { fontSize: 12, color: C.muted, fontWeight: 500 },

  donutCaption: { fontSize: 12.5, color: C.mid, textAlign: 'center', maxWidth: 240, lineHeight: 1.5 },

  hTrack: { height: 12, background: C.track, borderRadius: 999, overflow: 'hidden' },

  empty: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    minHeight: 180, color: C.muted, fontSize: 13.5, padding: '0 20px', lineHeight: 1.6,
  },

  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 0', color: C.muted, fontSize: 15 },
  loadingDot: { width: 16, height: 16, borderRadius: '50%', border: '3px solid #D2F1DA', borderTopColor: C.navy, animation: 'mc_spin 0.75s linear infinite' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', color: '#b91c1c', fontSize: 14, marginBottom: 18 },
}
