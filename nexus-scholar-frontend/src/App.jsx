import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './store/AuthContext.jsx'
import { usersApi } from './lib/api/users.api.js'
import AuthModal from './features/auth/AuthModal.jsx'
import Home       from './features/home/Home.jsx'
import Discover   from './features/discover/Discover.jsx'
import Consultant from './features/consultant/Consultant.jsx'
import Tracker    from './features/tracker/Tracker.jsx'
import Profile    from './features/profile/Profile.jsx'
// Maps UI tab names → backend ApplicationStatus enum values
export const STATUS_TO_BACKEND = {
  Interested: 'INTERESTED',
  Preparing:  'PREPARING_DOCUMENTS',
  Submitted:  'SUBMITTED',
  Decision:   'INTERVIEW',
}

const BG = '#080E1A', SU = '#0F1929', BO = '#1E3352', TX = '#E2E8F0', MU = '#64748B', AC = '#06B6D4'

export default function App() {
  const { user, isLoggedIn, loading } = useAuth()
  const [tab, setTab]             = useState('home')
  const [showAuth, setShowAuth]   = useState(false)
  const [tracker, setTracker]     = useState([])
  const [docChecks, setDocChecks] = useState({})

  // Load tracker from backend when user logs in
  useEffect(() => {
    if (!isLoggedIn) return
    usersApi.getApplications()
      .then(apps => {
        const mapped = apps.map(a => ({
          ...a.scholarship,
          id:     a.scholarshipId,
          _appId: a.id,
          status: ({
            INTERESTED:'Interested', PLANNING:'Preparing',
            PREPARING_DOCUMENTS:'Preparing', SUBMITTED:'Submitted',
            INTERVIEW:'Decision', ACCEPTED:'Decision',
            REJECTED:'Decision', WAITLISTED:'Decision', WITHDRAWN:'Decision',
          })[a.status] || 'Interested',
          added:  new Date(a.createdAt).toLocaleDateString(),
          docs:   a.scholarship?.docs || [],
        }))
        setTracker(mapped)
        const checks = {}
        apps.forEach(a => { checks[a.scholarshipId] = a.docsChecklist || {} })
        setDocChecks(checks)
      })
      .catch(() => {})
  }, [isLoggedIn])

  const addToTracker = useCallback(async (s) => {
    const key = s.id || s.name
    if (tracker.some(t => (t.id || t.name) === key)) return

    const entry = {
      ...s,
      status: 'Interested',
      added: new Date().toLocaleDateString(),
    }

    if (isLoggedIn) {
      // Only sync to backend if we have a real backend cuid (not a local seed ID like 'tb')
      // Seed IDs are short (≤10 chars); backend cuids are 25+ chars
      const backendId = s._backendId || (s.id && s.id.length > 10 ? s.id : null)
      if (backendId) {
        try {
          const app = await usersApi.track(backendId)
          entry._appId = app.id
        } catch {}
      }
      // If no backend ID, tracker works in-memory only (still useful as guest/seed)
    }

    setTracker(p => [...p, entry])
    const initChecks = {}
    ;(s.docs || []).forEach(d => { initChecks[d] = false })
    setDocChecks(p => ({ ...p, [key]: initChecks }))
  }, [tracker, isLoggedIn])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚡</div>
        <div style={{ color: MU, fontSize: 12, letterSpacing: 2, marginTop: 16 }}>LOADING NEXUS SCHOLAR...</div>
      </div>
    </div>
  )

  const TABS = [
    { id: 'home',       icon: '🏠', label: 'Home' },
    { id: 'discover',   icon: '🔍', label: 'Discover' },
    { id: 'consultant', icon: '🤖', label: 'AI Consultant' },
    { id: 'tracker',    icon: '📋', label: `Tracker${tracker.length > 0 ? ` (${tracker.length})` : ''}` },
    { id: 'profile',    icon: '👤', label: 'Profile' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TX }}>
      <style>{`
        @keyframes glow { 0%,100%{opacity:1;box-shadow:0 0 8px currentColor}50%{opacity:.35;box-shadow:0 0 2px currentColor} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes fadeIn{ from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        input,button,select,textarea { font-family: inherit; }
        input:focus,textarea:focus { outline: none !important; border-color: #2563EB !important; }
        .sc::-webkit-scrollbar{width:3px}
        .sc::-webkit-scrollbar-thumb{background:#1E3352;border-radius:3px}
      `}</style>

      {/* ── Header ── */}
      <header style={{ background: SU, borderBottom: `1px solid ${BO}`, padding: '11px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1E3A8A,#06B6D4)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 3, background: 'linear-gradient(90deg,#60A5FA,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NEXUS SCHOLAR
            </div>
            <div style={{ fontSize: 7.5, color: MU, letterSpacing: 3.5, marginTop: -1 }}>AI SCHOLARSHIP INTELLIGENCE</div>
          </div>
        </div>

        {/* Auth area */}
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0A1520', border: `1px solid ${BO}`, borderRadius: 22, padding: '6px 14px' }}>
            <span style={{ fontSize: 17 }}>🇵🇰</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: TX }}>{user?.fullName?.split(' ')[0] || 'Sayyad'}</div>
              <div style={{ fontSize: 8, color: MU, letterSpacing: 1 }}>CS · BACHELOR'S · IELTS-FREE</div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'glow 2s infinite' }} />
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)}
            style={{ background: '#1E3A8A', color: '#BAE6FD', border: 'none', borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ⚡ Sign In
          </button>
        )}
      </header>

      {/* ── Tabs ── */}
      <div style={{ background: SU, borderBottom: `1px solid ${BO}`, display: 'flex', paddingLeft: 12, overflowX: 'auto' }} className="sc">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '11px 18px', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3, whiteSpace: 'nowrap', color: tab === t.id ? AC : MU, borderBottom: tab === t.id ? `2px solid ${AC}` : '2px solid transparent', transition: 'color 0.15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1140, margin: '0 auto', padding: '22px 18px' }}>
        {tab === 'home'       && <Home       tracker={tracker} onAddTrack={addToTracker} onTabChange={setTab} />}
        {tab === 'discover'   && <Discover   tracker={tracker} onAddTrack={addToTracker} />}
        {tab === 'consultant' && <Consultant />}
        {tab === 'tracker'    && <Tracker    tracker={tracker} setTracker={setTracker} docChecks={docChecks} setDocChecks={setDocChecks} onTabChange={setTab} />}
        {tab === 'profile'    && <Profile    tracker={tracker} />}
      </main>

      <footer style={{ textAlign: 'center', padding: '18px', borderTop: `1px solid ${BO}`, marginTop: 40 }}>
        <span style={{ fontSize: 9, color: MU, letterSpacing: 2.5 }}>
          NEXUS SCHOLAR v2 · AI SCHOLARSHIP INTELLIGENCE · 🇵🇰 BUILT FOR SAYYAD
        </span>
      </footer>

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
