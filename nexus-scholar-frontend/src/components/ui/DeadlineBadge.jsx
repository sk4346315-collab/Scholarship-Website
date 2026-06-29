const MONTHS = {
  January:0, February:1, March:2, April:3, May:4, June:5,
  July:6, August:7, September:8, October:9, November:10, December:11
}

export function daysUntil(isoOrStr) {
  if (!isoOrStr) return null
  let d
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrStr)) {
    d = new Date(isoOrStr + 'T00:00:00')
  } else {
    const m = isoOrStr.match(/(\w+)\s+(\d{4})/)
    if (m && MONTHS[m[1]] !== undefined) d = new Date(parseInt(m[2]), MONTHS[m[1]], 28)
  }
  if (!d) return null
  return Math.ceil((d - new Date()) / 86400000)
}

export default function DeadlineBadge({ isoOrStr, small }) {
  const days = daysUntil(isoOrStr)
  const fs = small ? 10 : 12
  if (days === null) return <span style={{ color: '#64748B', fontSize: fs }}>{isoOrStr || '—'}</span>
  if (days < 0)  return <span style={{ color: '#EF4444', fontSize: fs, fontWeight: 700 }}>⛔ CLOSED</span>
  const color = days <= 30 ? '#EF4444' : days <= 90 ? '#F97316' : days <= 180 ? '#F59E0B' : '#10B981'
  const icon  = days <= 30 ? '🚨' : days <= 90 ? '⏰' : '📅'
  return (
    <span style={{ color, fontSize: fs, fontWeight: 700, fontFamily: 'monospace' }}>
      {icon} {days}d left
    </span>
  )
}
