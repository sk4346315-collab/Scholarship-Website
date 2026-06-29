import { useMemo } from 'react'
import { daysUntil } from '../../components/ui/DeadlineBadge.jsx'
import { SEED_SCHOLARSHIPS } from '../../data/seed.js'
import { useAuth } from '../../store/AuthContext.jsx'

const BG = '#080E1A', SU = '#0F1929', BO = '#1E3352', TX = '#E2E8F0', MU = '#64748B', AC = '#06B6D4'

export default function Home({ tracker, onAddTrack, onTabChange }) {
  const { user, isLoggedIn } = useAuth()

  const upcoming = useMemo(() => {
    const seen = new Set()
    return [...SEED_SCHOLARSHIPS, ...tracker]
      .filter(s => { if (seen.has(s.id || s.name)) return false; seen.add(s.id || s.name); return true })
      .map(s => ({ ...s, days: daysUntil(s.deadlineISO || s.deadline) }))
      .filter(s => s.days !== null && s.days > 0)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5)
  }, [tracker])

  const stats = [
    { icon: '🛰️', label: 'Scholarships Loaded',  value: SEED_SCHOLARSHIPS.length, color: AC },
    { icon: '✅', label: 'IELTS-Free Matches',     value: SEED_SCHOLARSHIPS.filter(s => !s.ieltsRequired).length, color: '#10B981' },
    { icon: '💰', label: 'Fully Funded',           value: SEED_SCHOLARSHIPS.filter(s => s.funding === 'Fully Funded').length, color: '#F59E0B' },
    { icon: '📋', label: 'Applications Tracked',  value: tracker.length, color: '#C4B5FD' },
  ]

  return (
    <div>
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg,#0D1929,#0A1520)', border: `1px solid ${BO}`, borderRadius: 14, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 42 }}>🇵🇰</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: TX }}>
            Salam, {isLoggedIn ? (user?.fullName?.split(' ')[0] || 'Sayyad') : 'Sayyad'}! ⚡
          </div>
          <div style={{ fontSize: 13, color: MU, marginTop: 4 }}>
            CS / AI / Cybersecurity · Bachelor's · IELTS-Free Strategy · 6 programs ready
          </div>
        </div>
        {!isLoggedIn && (
          <div style={{ marginLeft: 'auto', background: '#0D1929', border: `1px solid ${BO}`, borderRadius: 10, padding: '8px 14px', fontSize: 11, color: MU, textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: '#F59E0B', fontWeight: 700, marginBottom: 3 }}>⚠ Guest Mode</div>
            Tracker data won't persist.<br/>
            <button onClick={() => onTabChange && onTabChange('auth')} style={{ background: 'none', border: 'none', color: AC, cursor: 'pointer', fontWeight: 700, fontSize: 11, padding: 0, marginTop: 3 }}>
              Sign in to save →
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
        {stats.map(({ icon, label, value, color }) => (
          <div key={label} style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'monospace', marginTop: 6 }}>{value}</div>
            <div style={{ fontSize: 9, color: MU, letterSpacing: 1.5, marginTop: 2 }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Upcoming deadlines */}
      <div style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: MU, letterSpacing: 2, marginBottom: 16, fontFamily: 'monospace' }}>
          ⏰ UPCOMING DEADLINES
        </div>
        {upcoming.map(s => {
          const dc = s.days <= 30 ? '#EF4444' : s.days <= 90 ? '#F97316' : s.days <= 180 ? '#F59E0B' : '#10B981'
          const tracked = tracker.some(t => t.id === s.id || t.name === s.name)
          return (
            <div key={s.id || s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${BO}` }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{s.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TX, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                <div style={{ fontSize: 10, color: MU }}>{s.deadline}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: dc, fontFamily: 'monospace' }}>{s.days}</div>
                <div style={{ fontSize: 8, color: MU, letterSpacing: 1 }}>DAYS LEFT</div>
              </div>
              <button onClick={() => !tracked && onAddTrack(s)} disabled={tracked}
                style={{ background: 'transparent', border: `1px solid ${tracked ? BO : '#10B981'}`, borderRadius: 6, padding: '4px 10px', fontSize: 10, color: tracked ? MU : '#10B981', cursor: tracked ? 'default' : 'pointer', flexShrink: 0 }}>
                {tracked ? '✓' : 'Track'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 10, color: MU, letterSpacing: 2, marginBottom: 14, fontFamily: 'monospace' }}>QUICK ACTIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {[
            { icon: '🔍', label: 'Search Scholarships', desc: 'Find new programs', tab: 'discover' },
            { icon: '🤖', label: 'AI Consultant',       desc: 'Get personalized advice', tab: 'consultant' },
            { icon: '📋', label: 'View Tracker',        desc: 'Check applications', tab: 'tracker' },
            { icon: '👤', label: 'My Profile',          desc: 'View profile details', tab: 'profile' },
          ].map(({ icon, label, desc, tab }) => (
            <button key={tab} onClick={() => onTabChange(tab)}
              style={{ background: BG, border: `1px solid ${BO}`, borderRadius: 10, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#0D1929' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BO; e.currentTarget.style.background = BG }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TX }}>{icon} {label}</div>
              <div style={{ fontSize: 10, color: MU, marginTop: 3 }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
