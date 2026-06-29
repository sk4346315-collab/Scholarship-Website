// Date utility functions

const MONTHS = {
  January: 0, February: 1, March: 2,     April: 3,
  May: 4,     June: 5,     July: 6,      August: 7,
  September: 8, October: 9, November: 10, December: 11,
}

/**
 * Parse a deadline string like "February 2026" or ISO "2026-02-20"
 * into a Date object. Returns null if unparseable.
 */
export function parseDeadline(str) {
  if (!str) return null

  // ISO date: "2026-02-20"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(str + 'T00:00:00')
  }

  // "Month YYYY" → end of that month
  const m1 = str.match(/^(\w+)\s+(\d{4})$/)
  if (m1 && MONTHS[m1[1]] !== undefined) {
    return new Date(parseInt(m1[2]), MONTHS[m1[1]] + 1, 0) // last day of month
  }

  // "Month–Month YYYY" (range like "March–April 2026") → earlier month
  const m2 = str.match(/^(\w+)[–-](\w+)\s+(\d{4})$/)
  if (m2 && MONTHS[m2[1]] !== undefined) {
    return new Date(parseInt(m2[3]), MONTHS[m2[1]] + 1, 0)
  }

  return null
}

/**
 * Returns whole days until a deadline string/ISO date.
 * Returns null if unparseable, negative if already passed.
 */
export function daysUntil(isoOrStr) {
  const d = parseDeadline(isoOrStr)
  if (!d) return null
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
}

/**
 * Format a Date or ISO string as "Jan 15, 2026"
 */
export function formatDate(dateOrStr) {
  if (!dateOrStr) return '—'
  const d = typeof dateOrStr === 'string' ? new Date(dateOrStr) : dateOrStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Returns a human-readable urgency label for days remaining.
 */
export function urgencyLabel(days) {
  if (days === null) return { label: '—',           color: '#64748B', icon: '' }
  if (days < 0)      return { label: 'Closed',      color: '#EF4444', icon: '⛔' }
  if (days <= 7)     return { label: `${days}d`,    color: '#EF4444', icon: '🚨' }
  if (days <= 30)    return { label: `${days}d`,    color: '#F97316', icon: '⏰' }
  if (days <= 90)    return { label: `${days}d`,    color: '#F59E0B', icon: '📅' }
  return               { label: `${days}d`,          color: '#10B981', icon: '📅' }
}
