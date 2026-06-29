const BO = '#1E3352'

export default function DocChecklist({ docs = [], checks = {}, onChange }) {
  const done  = docs.filter(d => checks[d]).length
  const total = docs.length
  const pct   = total ? Math.round((done / total) * 100) : 0
  const barColor = pct === 100 ? '#10B981' : '#06B6D4'

  return (
    <div style={{ borderTop: `1px solid ${BO}`, padding: '14px 16px' }}>
      {/* Progress header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: '#64748B', letterSpacing: 2, fontFamily: 'monospace' }}>
          DOCUMENT CHECKLIST
        </span>
        <span style={{ fontSize: 11, color: barColor, fontWeight: 700, fontFamily: 'monospace' }}>
          {done}/{total} · {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: BO, borderRadius: 2, marginBottom: 14 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Doc items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 6 }}>
        {docs.map(doc => {
          const checked = !!checks[doc]
          return (
            <label key={doc}
              style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', background: '#080E1A', border: `1px solid ${checked ? '#10B981' : BO}`, borderRadius: 8, padding: '7px 11px', transition: 'border-color 0.15s' }}>
              <div
                onClick={() => onChange && onChange(doc, !checked)}
                style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, background: checked ? '#10B981' : BO, border: `1px solid ${checked ? '#10B981' : '#334155'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                {checked && <span style={{ color: '#000', fontSize: 10, fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: 11, color: checked ? '#10B981' : '#E2E8F0', textDecoration: checked ? 'line-through' : 'none', fontWeight: checked ? 600 : 400 }}>
                {doc}
              </span>
            </label>
          )
        })}
      </div>

      {pct === 100 && (
        <div style={{ marginTop: 12, background: '#071A0F', border: '1px solid #065F46', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#34D399', fontWeight: 700 }}>
          🎉 All documents checked — you are ready to apply!
        </div>
      )}
    </div>
  )
}
