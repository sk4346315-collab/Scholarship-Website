import { useState } from 'react'
import DCSBadge from '../ui/DCSBadge.jsx'
import DeadlineBadge from '../ui/DeadlineBadge.jsx'

const TIER_COLORS = { ALPHA: '#F59E0B', BETA: '#60A5FA', GAMMA: '#A78BFA' }
const COMP_COLORS = { Low: '#10B981', Medium: '#F59E0B', High: '#F97316', 'Very High': '#EF4444' }
const BO = '#1E3352'

export default function ScholarCard({ s, onTrack, tracked }) {
  const [hov, setHov] = useState(false)
  const tc = TIER_COLORS[s.tier] || '#94A3B8'
  const cc = COMP_COLORS[s.competitiveness] || '#94A3B8'

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: '#0F1929',
        border: `1px solid ${hov ? '#2563EB' : BO}`,
        borderRadius: 14, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 11,
        transition: 'all 0.18s', transform: hov ? 'translateY(-2px)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Tier ribbon */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        background: tc, color: '#000',
        fontSize: 8, fontWeight: 900, padding: '3px 9px',
        borderBottomLeftRadius: 9, letterSpacing: 1.5,
      }}>
        TIER {s.tier}
      </div>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 22 }}>{s.flag}</span>
          <div>
            <span style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace', letterSpacing: 2 }}>
              {s.country?.toUpperCase()}
            </span>
            {s.competitiveness && (
              <span style={{ fontSize: 8, color: cc, marginLeft: 8, fontFamily: 'monospace', letterSpacing: 1 }}>
                · {s.competitiveness.toUpperCase()} COMP
              </span>
            )}
          </div>
        </div>
        <h3 style={{ color: '#E2E8F0', fontSize: 13.5, fontWeight: 800, margin: 0, lineHeight: 1.35, paddingRight: 42 }}>
          {s.name}
        </h3>
        <p style={{ color: '#64748B', fontSize: 11, margin: '3px 0 0', fontStyle: 'italic' }}>{s.university}</p>
      </div>

      <DCSBadge score={s.dcs || 70} />

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {[
          { l: 'FUNDING',  v: s.funding, c: '#10B981' },
          { l: 'MATCH',    v: `${s.suitability || 80}%`, c: '#06B6D4', mono: true },
          { l: 'ENGLISH',  v: s.ieltsRequired ? '⚠ IELTS REQ' : '✓ IELTS-FREE',
            c: s.ieltsRequired ? '#EF4444' : '#10B981',
            bg: s.ieltsRequired ? '#1A0808' : '#081A10' },
          { l: 'DEADLINE', v: <DeadlineBadge isoOrStr={s.deadlineISO || s.deadline} small />, c: '#F59E0B' },
        ].map(({ l, v, c, bg, mono }) => (
          <div key={l} style={{ background: bg || '#080E1A', borderRadius: 7, padding: '7px 9px' }}>
            <div style={{ fontSize: 8, color: '#475569', letterSpacing: 1.5, marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: 11, color: c, fontWeight: 700, fontFamily: mono ? 'monospace' : 'inherit' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Stipend */}
      {s.stipend && s.stipend !== 'Not specified' && (
        <div style={{ background: '#0A1520', border: `1px solid ${BO}`, borderRadius: 7, padding: '7px 11px' }}>
          <span style={{ fontSize: 8, color: '#475569', letterSpacing: 1.5 }}>STIPEND · </span>
          <span style={{ fontSize: 11, color: '#60A5FA', fontWeight: 700, fontFamily: 'monospace' }}>{s.stipend}</span>
        </div>
      )}

      {/* Key benefit */}
      {s.keyBenefit && (
        <p style={{ color: '#94A3B8', fontSize: 11, margin: 0, lineHeight: 1.65, borderLeft: `2px solid ${BO}`, paddingLeft: 9 }}>
          {s.keyBenefit}
        </p>
      )}

      {/* IELTS note */}
      {s.ieltsNote && (
        <div style={{ fontSize: 10, color: '#10B981', background: '#081A10', borderRadius: 6, padding: '4px 10px' }}>
          📋 {s.ieltsNote}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <a href={s.officialUrl} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, background: '#1E3A8A', color: '#BAE6FD', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 700, textAlign: 'center', textDecoration: 'none', letterSpacing: 0.5 }}>
          Official Site ↗
        </a>
        <button onClick={() => onTrack && onTrack(s)} disabled={tracked}
          style={{ background: tracked ? '#0A1A0A' : '#081A10', color: tracked ? '#475569' : '#10B981', border: `1px solid ${tracked ? BO : '#10B981'}`, borderRadius: 8, padding: '8px 13px', fontSize: 11, fontWeight: 700, cursor: tracked ? 'default' : 'pointer' }}>
          {tracked ? '✓' : '+ Track'}
        </button>
      </div>
    </div>
  )
}
