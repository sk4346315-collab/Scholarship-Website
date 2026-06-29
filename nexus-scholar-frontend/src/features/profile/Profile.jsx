import { useState } from 'react'
import { useAuth } from '../../store/AuthContext.jsx'
import { usersApi } from '../../lib/api/users.api.js'

const BG = '#080E1A', SU = '#0F1929', BO = '#1E3352', TX = '#E2E8F0', MU = '#64748B', AC = '#06B6D4'

const SECTIONS = [
  { title: 'Academic Profile', fields: [
    { l: 'Field of Study',  v: 'Computer Science / AI / Cybersecurity', icon: '💻', ok: true },
    { l: 'Target Degree',   v: "Bachelor's (Undergraduate)",             icon: '🎓', ok: true },
    { l: 'Stream',          v: 'ICS (Intermediate in Computer Science)', icon: '📚', ok: true },
    { l: 'NTS NAT-ICS',     v: 'Prepared — practice papers completed',  icon: '📝', ok: true },
  ]},
  { title: 'Language Profile', fields: [
    { l: 'Strategy',              v: 'IELTS-FREE — Tier 1 Priority',                     icon: '🗣',  ok: true, highlight: true },
    { l: 'MOI Letter',            v: 'Available (English-medium school)',                 icon: '✅',  ok: true },
    { l: 'English Proficiency Cert', v: 'Available from institution',                   icon: '✅',  ok: true },
    { l: 'IELTS Score',           v: 'Not required (IELTS-free strategy active)',         icon: '⚪',  ok: true },
  ]},
  { title: 'Documents Ready', fields: [
    { l: 'Europass CV',          v: 'Application-ready (assessed ✓)',                    icon: '📄', ok: true },
    { l: 'Transcripts',          v: 'Available',                                          icon: '📋', ok: true },
    { l: 'Passport',             v: 'Valid — confirm expiry is after 2027',              icon: '🛂', ok: true },
    { l: 'Character Certificate', v: 'Available (Russian translation done for KZ)',      icon: '📜', ok: true },
  ]},
  { title: 'Extracurriculars', fields: [
    { l: 'Music Production',  v: 'FL Studio · Trap & Amapiano · 2 years',               icon: '🎵', ok: true },
    { l: 'VST Development',   v: 'JUCE/C++ plugin "Khpal Awaaz" — Pashto folk instruments', icon: '⚙️', ok: true },
    { l: 'Cultural Project',  v: 'Digitizing Pashto/Afghan folk instruments',            icon: '🏺', ok: true },
    { l: 'Video Editing',     v: 'Active side skill',                                    icon: '🎬', ok: true },
  ]},
]

const STRATEGY = [
  'Apply to Türkiye Bursları in Feb — strongest overall match (96% suitability)',
  'Apply to Stipendium Hungaricum in Jan — lowest competition, IELTS-free, FIRST DEADLINE',
  'Apply to China CSC in Mar — fully funded, MOI accepted, 50+ universities',
  'Apply to Poland NAWA in May — low competition, strong CS programs',
  'Track KGSP Korea for March — highest stipend (~$680/month)',
]

export default function Profile({ tracker }) {
  const { user, isLoggedIn, logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const saveProfile = async () => {
    if (!isLoggedIn) return
    setSaving(true)
    try {
      await usersApi.updateProfile({
        nationality: 'PK',
        hasMoi: true,
        hasEnglishCert: true,
        preferredFields: ['cs', 'ai', 'cybersecurity'],
        preferredCountries: ['TR', 'CN', 'HU', 'KR', 'MY', 'PL'],
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Profile header */}
      <div style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#1E3A8A,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            🇵🇰
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: TX }}>{isLoggedIn ? (user?.fullName || 'Sayyad') : 'Sayyad'}</div>
            <div style={{ fontSize: 12, color: MU, marginTop: 2 }}>Pakistan · 18 years old · ICS Stream</div>
            {isLoggedIn && <div style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>✓ Logged in as {user?.email}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#10B981', fontFamily: 'monospace' }}>92%</div>
            <div style={{ fontSize: 9, color: MU, letterSpacing: 1.5 }}>PROFILE COMPLETE</div>
          </div>
        </div>

        {/* Completeness bar */}
        <div style={{ height: 5, background: BO, borderRadius: 3, marginBottom: 6 }}>
          <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg,#10B981,#06B6D4)', borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 10, color: MU }}>Missing: Official IELTS score (optional — MOI strategy active)</div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {isLoggedIn ? (
            <>
              <button onClick={saveProfile} disabled={saving}
                style={{ background: saving ? '#0A2535' : '#0E7490', color: '#E0F2FE', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Saving...' : saved ? '✓ Saved!' : '💾 Save Profile to Backend'}
              </button>
              <button onClick={logout}
                style={{ background: 'transparent', border: '1px solid #7F1D1D', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#FCA5A5', cursor: 'pointer' }}>
                Sign Out
              </button>
            </>
          ) : (
            <div style={{ fontSize: 12, color: MU, background: BG, border: `1px solid ${BO}`, borderRadius: 8, padding: '8px 14px' }}>
              ⚠ Guest mode — sign in to save your profile and sync tracker across devices
            </div>
          )}
        </div>
      </div>

      {/* Profile sections */}
      {SECTIONS.map(({ title, fields }) => (
        <div key={title} style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 14, padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: MU, letterSpacing: 2, marginBottom: 14, fontFamily: 'monospace' }}>{title.toUpperCase()}</div>
          {fields.map(({ l, v, icon, ok, highlight }) => (
            <div key={l} style={{ display: 'flex', gap: 11, padding: '9px 0', borderBottom: `1px solid ${BO}`, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: MU, letterSpacing: 1 }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 12.5, color: highlight ? '#10B981' : TX, fontWeight: highlight ? 700 : 400, marginTop: 2 }}>{v}</div>
              </div>
              <span style={{ color: ok ? '#10B981' : '#EF4444', fontSize: 13, flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Strategy */}
      <div style={{ background: '#071A0F', border: '1px solid #065F46', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 9, color: '#34D399', letterSpacing: 2, marginBottom: 14, fontFamily: 'monospace' }}>✅ NEXUS RECOMMENDED STRATEGY</div>
        {STRATEGY.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <span style={{ color: '#34D399', fontWeight: 900, fontFamily: 'monospace', flexShrink: 0 }}>{i+1}.</span>
            <span style={{ fontSize: 12.5, color: '#A7F3D0', lineHeight: 1.6 }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
