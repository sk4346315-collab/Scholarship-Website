// NEXUS SCHOLAR — App-wide constants

// ── API ───────────────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const ANTHROPIC_MODEL = 'claude-sonnet-4-6'
export const ANTHROPIC_MAX_TOKENS = 1000

// ── Scholarship tiers ─────────────────────────────────────────
export const TIERS = {
  ALPHA: { label: 'ALPHA', color: '#F59E0B', desc: 'Highest priority — fully funded + no IELTS' },
  BETA:  { label: 'BETA',  color: '#60A5FA', desc: 'Strong match — good funding, minor requirements' },
  GAMMA: { label: 'GAMMA', color: '#A78BFA', desc: 'Possible match — check requirements carefully' },
}

// ── Application statuses (maps UI label → backend enum) ───────
export const STATUS_TO_BACKEND = {
  Interested:  'INTERESTED',
  Preparing:   'PREPARING_DOCUMENTS',
  Submitted:   'SUBMITTED',
  Decision:    'INTERVIEW',
}

export const STATUS_FROM_BACKEND = {
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

export const UI_STATUSES = ['Interested', 'Preparing', 'Submitted', 'Decision']

// ── Status colors ─────────────────────────────────────────────
export const STATUS_COLORS = {
  Interested: { bg: '#0D1A33', border: '#1E3A8A', text: '#60A5FA' },
  Preparing:  { bg: '#1A1200', border: '#78350F', text: '#FCD34D' },
  Submitted:  { bg: '#071A0F', border: '#065F46', text: '#34D399' },
  Decision:   { bg: '#130A1F', border: '#4C1D95', text: '#C4B5FD' },
}

// ── Country flags lookup ──────────────────────────────────────
export const COUNTRY_FLAGS = {
  Turkey:       '🇹🇷', China:        '🇨🇳',
  Hungary:      '🇭🇺', 'South Korea': '🇰🇷',
  Japan:        '🇯🇵', Germany:      '🇩🇪',
  Malaysia:     '🇲🇾', Poland:       '🇵🇱',
  'Saudi Arabia': '🇸🇦', UAE:        '🇦🇪',
  Qatar:        '🇶🇦', Kazakhstan:   '🇰🇿',
  Pakistan:     '🇵🇰',
}

// ── Quick search suggestions ──────────────────────────────────
export const SEARCH_SUGGESTIONS = [
  'Fully funded CS bachelor no IELTS 2026',
  'Türkiye Bursları computer science 2026',
  'Hungary Stipendium CS deadline 2026',
  'China CSC Pakistan no IELTS bachelor',
  'South Korea KGSP CS undergraduate 2026',
  'Malaysia MIS computer science 2026',
]

// ── Quick consultant questions ────────────────────────────────
export const QUICK_QUESTIONS = [
  'Am I eligible for Türkiye Bursları 2026?',
  'Compare China CSC vs Hungary Stipendium',
  'Create my 2025–2026 application timeline',
  'Documents I need for KGSP Korea?',
  'Which scholarships open applications first?',
  'How strong is my profile for fully-funded programs?',
]

// ── Student profile defaults (pre-loaded for Sayyad) ─────────
export const DEFAULT_PROFILE = {
  name:        'Sayyad',
  nationality: 'Pakistani',
  flag:        '🇵🇰',
  age:         18,
  field:       'CS / AI / Cybersecurity',
  degree:      "Bachelor's",
  language:    'IELTS-Free · MOI Certificate',
  stream:      'ICS Stream',
}
