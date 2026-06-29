// Text and number formatting utilities

/**
 * Convert a backend ApplicationStatus enum to UI display name.
 * e.g. "PREPARING_DOCUMENTS" → "Preparing"
 */
export function formatStatus(backendStatus) {
  const map = {
    INTERESTED:           'Interested',
    PLANNING:             'Preparing',
    PREPARING_DOCUMENTS:  'Preparing',
    SUBMITTED:            'Submitted',
    INTERVIEW:            'Decision',
    ACCEPTED:             'Decision',
    REJECTED:             'Decision',
    WAITLISTED:           'Decision',
    WITHDRAWN:            'Decision',
  }
  return map[backendStatus] || 'Interested'
}

/**
 * Convert a UI status to backend ApplicationStatus enum.
 * e.g. "Preparing" → "PREPARING_DOCUMENTS"
 */
export function toBackendStatus(uiStatus) {
  const map = {
    Interested: 'INTERESTED',
    Preparing:  'PREPARING_DOCUMENTS',
    Submitted:  'SUBMITTED',
    Decision:   'INTERVIEW',
  }
  return map[uiStatus] || 'INTERESTED'
}

/**
 * Truncate a string to maxLength with ellipsis.
 */
export function truncate(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}

/**
 * Format a scholarship suitability score as a percentage label.
 */
export function formatScore(score) {
  if (score == null) return '—'
  return `${Math.round(score)}%`
}

/**
 * Slugify a string for use as an ID or URL segment.
 * e.g. "Türkiye Bursları" → "turkiye-burslari"
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Capitalize the first letter of every word.
 */
export function titleCase(str) {
  if (!str) return ''
  return str.replace(/\w/g, c => c.toUpperCase())
}

/**
 * Format a monthly stipend amount to a readable string.
 * e.g. (345, "USD") → "$345/month"
 */
export function formatStipend(amount, currency) {
  if (!amount) return null
  const symbols = { USD: '$', EUR: '€', GBP: '£', KRW: '₩', CNY: '¥', TRY: '₺' }
  const sym = symbols[currency] || currency || ''
  return `${sym}${amount.toLocaleString()}/month`
}

/**
 * Returns true if a string looks like a backend cuid (long, starts with 'c').
 * Used to distinguish local seed IDs ('tb', 'csc') from real DB IDs.
 */
export function isBackendId(id) {
  return typeof id === 'string' && id.length > 10
}
