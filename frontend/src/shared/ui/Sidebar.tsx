import { Link, useLocation } from 'react-router-dom'
import type { CSSProperties, ReactNode } from 'react'
import { C } from '../styles/tokens'
import Icon from './Icon'

/* ------------------------------ Nav icons -------------------------------- */

function svgWrap(children: ReactNode, color: string) {
  return (
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  )
}
function NavGrid({ color }: { color: string }) { return svgWrap(<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>, color) }
function NavPulse({ color }: { color: string }) { return svgWrap(<path d="M3 12h4l2 6 4-14 2 8h6" />, color) }
function NavDoc({ color }: { color: string }) { return svgWrap(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h8" /></>, color) }

const NAV = [
  { key: 'overview', label: 'Overview', href: '/dashboard', svg: NavGrid },
  { key: 'estimator', label: 'Estimator', href: '/estimator', svg: NavPulse },
  { key: 'reports', label: 'Reports', href: '/reports', svg: NavDoc },
]

interface SidebarProps {
  /** Brand subtitle shown under "MediCost" (e.g. "Analytics", "Estimator"). */
  subtitle?: string
  onSignOut: () => void
}

export default function Sidebar({ subtitle = 'Analytics', onSignOut }: SidebarProps) {
  const { pathname } = useLocation()
  const activeKey =
    pathname.startsWith('/estimator') ? 'estimator'
    : pathname.startsWith('/reports') ? 'reports'
    : 'overview'

  return (
    <aside style={s.sidebar} className="mc-dash-sidebar">
      <div style={s.sideBrand}>
        <div style={s.sideLogo}>M</div>
        <div className="mc-collapse">
          <div style={s.sideName}>MediCost</div>
          <div style={s.sideSub}>{subtitle}</div>
        </div>
      </div>

      <nav style={s.nav}>
        {NAV.map((item) => {
          const Svg = item.svg
          const active = item.key === activeKey
          return (
            <Link key={item.key} to={item.href} className="mc-nav-dark"
              style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}>
              <Svg color={active ? '#fff' : C.sidebarText} />
              <span className="mc-collapse">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <button type="button" onClick={onSignOut} style={s.signOut} className="mc-nav-dark">
        <Icon name="logout" size={18} color={C.sidebarText} />
        <span className="mc-collapse">Sign out</span>
      </button>
    </aside>
  )
}

const s: Record<string, CSSProperties> = {
  sidebar: {
    width: 220, flexShrink: 0, background: C.dark,
    display: 'flex', flexDirection: 'column', padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh',
  },
  sideBrand: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 6px 24px' },
  sideLogo: {
    width: 40, height: 40, borderRadius: '50%', background: C.navyActive, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 18, fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0,
  },
  sideName: { fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' },
  sideSub: { fontSize: 12, color: C.sidebarText },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10,
    color: C.sidebarText, textDecoration: 'none', fontSize: 14, fontWeight: 500,
  },
  navItemActive: { background: C.navyActive, color: '#fff' },
  signOut: {
    marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 12px', borderRadius: 10, color: C.sidebarText,
    fontSize: 14, fontWeight: 500, background: 'transparent', border: 'none',
    cursor: 'pointer', textAlign: 'left', width: '100%',
  },
}
