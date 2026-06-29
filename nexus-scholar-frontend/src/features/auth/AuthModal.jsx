import { useState } from 'react'
import { useAuth } from '../../store/AuthContext.jsx'

const BG = '#080E1A', SU = '#0F1929', BO = '#1E3352', TX = '#E2E8F0', MU = '#64748B'

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth()
  const [mode, setMode]   = useState('login')   // 'login' | 'register'
  const [form, setForm]   = useState({ email: '', password: '', fullName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.email || !form.password) { setError('Email and password are required'); return }
    setLoading(true); setError(null)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.email, form.password, form.fullName)
      onClose()
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Overlay */
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(8,14,26,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>

      {/* Modal */}
      <div style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 400 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 9, color: '#06B6D4', letterSpacing: 3, fontFamily: 'monospace' }}>
              NEXUS SCHOLAR
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: TX, marginTop: 2 }}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MU, fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#1A0608', border: '1px solid #7F1D1D', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#FCA5A5', fontSize: 12 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 10, color: MU, letterSpacing: 1.5, display: 'block', marginBottom: 5 }}>FULL NAME (optional)</label>
              <input
                value={form.fullName} onChange={e => set('fullName', e.target.value)}
                placeholder="Sayyad Khan"
                style={{ width: '100%', background: BG, border: `1px solid ${BO}`, borderRadius: 8, padding: '10px 14px', color: TX, fontSize: 13 }}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: 10, color: MU, letterSpacing: 1.5, display: 'block', marginBottom: 5 }}>EMAIL</label>
            <input
              type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="you@email.com"
              style={{ width: '100%', background: BG, border: `1px solid ${BO}`, borderRadius: 8, padding: '10px 14px', color: TX, fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: MU, letterSpacing: 1.5, display: 'block', marginBottom: 5 }}>PASSWORD</label>
            <input
              type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="Min 8 characters"
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={{ width: '100%', background: BG, border: `1px solid ${BO}`, borderRadius: 8, padding: '10px 14px', color: TX, fontSize: 13 }}
            />
          </div>
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={loading}
          style={{ width: '100%', marginTop: 20, background: loading ? '#1E3A8A' : '#2563EB', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.5 }}>
          {loading ? '…' : mode === 'login' ? '⚡ Sign In' : '⚡ Create Account'}
        </button>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: MU }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
            style={{ background: 'none', border: 'none', color: '#06B6D4', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </div>

        {/* Guest note */}
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#334155' }}>
          You can also continue as guest — AI search works without an account.
        </div>
      </div>
    </div>
  )
}
