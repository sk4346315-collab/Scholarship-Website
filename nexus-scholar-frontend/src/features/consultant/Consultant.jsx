import { useState, useRef, useEffect } from 'react'
import { aiApi } from '../../lib/api/ai.api.js'

const BG = '#080E1A', SU = '#0F1929', BO = '#1E3352', TX = '#E2E8F0', MU = '#64748B'
const AC = '#06B6D4', PR = '#2563EB'

const QUICK = [
  "Am I eligible for Türkiye Bursları 2026?",
  "Compare China CSC vs Hungary Stipendium",
  "Create my 2025–2026 application timeline",
  "Documents I need for KGSP Korea?",
  "Which scholarships open applications first?",
  "How strong is my profile for fully-funded programs?",
]

const INIT_MSG = {
  role: 'assistant',
  content: `Salam Sayyad! 👋 Your profile is fully loaded.\n\n🇵🇰 Pakistani · 18yo · ICS Stream\n📚 CS / AI / Cybersecurity · Bachelor's\n🗣 IELTS-Free (MOI Certificate + English Proficiency Cert)\n⚡ Europass CV: Application-Ready\n\nI'm connected to the web right now — I can check current deadlines and requirements for you. What do you want to work on?`,
}

export default function Consultant() {
  const [msgs, setMsgs]     = useState([INIT_MSG])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  const send = async (override) => {
    const text = override || input.trim()
    if (!text || loading) return
    const history = [...msgs, { role: 'user', content: text }]
    setMsgs(history)
    setInput('')
    setLoading(true)
    try {
      const apiMsgs = history.map(m => ({ role: m.role, content: m.content }))
      const reply   = await aiApi.chat(apiMsgs)
      setMsgs(h => [...h, { role: 'assistant', content: reply || 'Let me check on that...' }])
    } catch (e) {
      setMsgs(h => [...h, { role: 'assistant', content: `⚠️ ${e.message || 'Connection error. Please try again.'}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 175px)' }}>
      {/* Quick question chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 13 }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            style={{ background: '#0A1520', border: `1px solid ${BO}`, borderRadius: 18, padding: '5px 12px', fontSize: 10.5, color: MU, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0E7490'; e.currentTarget.style.color = '#67E8F9' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BO; e.currentTarget.style.color = MU }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, background: SU, border: `1px solid ${BO}`, borderRadius: 14, padding: 18, overflowY: 'auto', marginBottom: 13 }}
        className="sc">
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 9, marginBottom: 18, animation: i===msgs.length-1?'fadeIn 0.2s ease':undefined }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: m.role === 'user' ? 'linear-gradient(135deg,#1E3A8A,#2563EB)' : 'linear-gradient(135deg,#0E4A5A,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
              {m.role === 'user' ? '🇵🇰' : '⚡'}
            </div>
            <div style={{ background: m.role === 'user' ? '#1E3A8A' : BG, border: `1px solid ${m.role === 'user' ? '#3B82F6' : BO}`, borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', padding: '11px 15px', maxWidth: '77%', fontSize: 13, lineHeight: 1.75, color: TX, whiteSpace: 'pre-wrap' }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 9, alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#0E4A5A,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <div style={{ background: BG, border: `1px solid ${BO}`, borderRadius: '4px 12px 12px 12px', padding: '11px 16px', display: 'flex', gap: 5 }}>
              {[0,1,2].map(j => (
                <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: AC, animation: `glow 1s ease-in-out ${j*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 9 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about scholarships, eligibility, timelines, documents..."
          style={{ flex: 1, background: SU, border: `1px solid ${BO}`, borderRadius: 10, padding: '12px 15px', color: TX, fontSize: 13 }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          style={{ background: loading || !input.trim() ? '#0D1929' : PR, color: loading || !input.trim() ? MU : 'white', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 12, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '...' : 'Ask ↑'}
        </button>
      </div>
    </div>
  )
}
