export default function DCSBadge({ score }) {
  const color = score >= 85 ? '#10B981' : score >= 65 ? '#F59E0B' : '#6B7280'
  const label = score >= 85 ? 'VERIFIED' : score >= 65 ? 'PARTIAL' : 'CHECKING'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: color, boxShadow: `0 0 7px ${color}`,
        animation: 'glow 2s ease-in-out infinite',
      }} />
      <span style={{ fontFamily: 'monospace', fontSize: 9, color, fontWeight: 700, letterSpacing: 0.8 }}>
        DCS {score} · {label}
      </span>
    </div>
  )
}
