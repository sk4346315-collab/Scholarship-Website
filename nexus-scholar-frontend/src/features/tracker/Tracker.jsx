import { useState } from 'react'
import DocChecklist from '../../components/scholarship/DocChecklist.jsx'
import { useAuth } from '../../store/AuthContext.jsx'
import { STATUS_TO_BACKEND } from '../../App.jsx'
import { usersApi } from '../../lib/api/users.api.js'

const SU = '#0F1929', BO = '#1E3352', TX = '#E2E8F0', MU = '#64748B', AC = '#06B6D4'
const STATUSES = ['Interested', 'Preparing', 'Submitted', 'Decision']
const SC = {
  Interested: { bg: '#0D1A33', bo: '#1E3A8A', lc: '#60A5FA' },
  Preparing:  { bg: '#1A1200', bo: '#78350F', lc: '#FCD34D' },
  Submitted:  { bg: '#071A0F', bo: '#065F46', lc: '#34D399' },
  Decision:   { bg: '#130A1F', bo: '#4C1D95', lc: '#C4B5FD' },
}

export default function Tracker({ tracker, setTracker, docChecks, setDocChecks, onTabChange }) {
  const { isLoggedIn } = useAuth()
  const [expanded, setExpanded] = useState(null)
  const [saving, setSaving] = useState({})

  const moveStatus = async (item, status) => {
    setTracker(p => p.map(t => (t.id === item.id || t.name === item.name) ? { ...t, status } : t))
    if (isLoggedIn && item._appId) {
      // Convert UI display name → backend enum (e.g. 'Preparing' → 'PREPARING_DOCUMENTS')
      const backendStatus = STATUS_TO_BACKEND[status] || status.toUpperCase()
      try { await usersApi.updateStatus(item._appId, backendStatus) } catch {}
    }
  }

  const remove = async (item) => {
    setTracker(p => p.filter(t => t.id !== item.id && t.name !== item.name))
    if (isLoggedIn && item._appId) {
      try { await usersApi.removeApp(item._appId) } catch {}
    }
  }

  const toggleDoc = async (itemKey, doc, val) => {
    const updated = { ...(docChecks[itemKey] || {}), [doc]: val }
    setDocChecks(p => ({ ...p, [itemKey]: updated }))
    if (isLoggedIn) {
      const item = tracker.find(t => (t.id || t.name) === itemKey)
      if (item?._appId) {
        setSaving(p => ({ ...p, [itemKey]: true }))
        try { await usersApi.updateDocs(item._appId, updated) } catch {}
        finally { setSaving(p => ({ ...p, [itemKey]: false })) }
      }
    }
  }

  if (tracker.length === 0) return (
    <div style={{ textAlign: 'center', padding: '70px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: TX, marginBottom: 9 }}>No Applications Tracked</div>
      <div style={{ color: MU, fontSize: 13, maxWidth: 360, margin: '0 auto', lineHeight: 1.8 }}>
        Go to{' '}
        <button onClick={() => onTabChange('discover')} style={{ background: 'none', border: 'none', color: AC, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Discover</button>
        {' '}or{' '}
        <button onClick={() => onTabChange('home')} style={{ background: 'none', border: 'none', color: AC, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Home</button>
        , find a scholarship and click <strong style={{ color: '#10B981' }}>+ Track</strong>.
      </div>
    </div>
  )

  return (
    <div>
      {/* Status summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
        {STATUSES.map(s => {
          const col = SC[s]
          const count = tracker.filter(t => t.status === s).length
          return (
            <div key={s} style={{ background: col.bg, border: `1px solid ${col.bo}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: col.lc, fontFamily: 'monospace' }}>{count}</div>
              <div style={{ fontSize: 9, color: MU, letterSpacing: 1.5, marginTop: 2 }}>{s.toUpperCase()}</div>
            </div>
          )
        })}
      </div>

      {/* Application rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tracker.map(item => {
          const key = item.id || item.name
          const col = SC[item.status] || SC.Interested
          const checks = docChecks[key] || {}
          const isExp = expanded === key
          const done = (item.docs || []).filter(d => checks[d]).length
          const total = item.docs?.length || 0
          const pct  = total ? Math.round(done/total*100) : 0

          return (
            <div key={key} style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 13 }}>
              {/* Main row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.flag}</span>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: TX }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: MU, marginTop: 2 }}>{item.deadline} · Added {item.added}</div>
                </div>

                {/* Doc progress */}
                {total > 0 && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: pct===100?'#10B981':AC, fontFamily: 'monospace' }}>{done}/{total} docs</div>
                    <div style={{ width: 80, height: 4, background: BO, borderRadius: 2, marginTop: 3 }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: pct===100?'#10B981':AC, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                {/* Status badge */}
                <div style={{ background: col.bg, border: `1px solid ${col.bo}`, borderRadius: 7, padding: '4px 10px', flexShrink: 0 }}>
                  <span style={{ fontSize: 9, color: col.lc, fontWeight: 700, letterSpacing: 1 }}>{item.status.toUpperCase()}</span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap' }}>
                  {total > 0 && (
                    <button onClick={() => setExpanded(isExp ? null : key)}
                      style={{ background: 'transparent', border: `1px solid ${isExp ? AC : BO}`, borderRadius: 6, padding: '4px 9px', fontSize: 10, color: isExp ? AC : MU, cursor: 'pointer', fontWeight: 700 }}>
                      {isExp ? '▲ Docs' : '📋 Docs'}
                    </button>
                  )}
                  {STATUSES.filter(s => s !== item.status).map(s => (
                    <button key={s} onClick={() => moveStatus(item, s)}
                      style={{ background: 'transparent', border: `1px solid ${BO}`, borderRadius: 6, padding: '4px 9px', fontSize: 10, color: MU, cursor: 'pointer' }}>
                      →{s.slice(0,4)}
                    </button>
                  ))}
                  <button onClick={() => remove(item)}
                    style={{ background: '#1A0608', border: '1px solid #7F1D1D', borderRadius: 6, padding: '4px 9px', fontSize: 10, color: '#FCA5A5', cursor: 'pointer', fontWeight: 700 }}>
                    ✕
                  </button>
                </div>
              </div>

              {/* Doc checklist */}
              {isExp && item.docs?.length > 0 && (
                <DocChecklist
                  docs={item.docs}
                  checks={checks}
                  onChange={(doc, val) => toggleDoc(key, doc, val)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
