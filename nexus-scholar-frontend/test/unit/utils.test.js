import { describe, it, expect } from 'vitest'
import { daysUntil, formatDate } from '../../src/utils/date.js'
import { formatStatus, toBackendStatus, slugify } from '../../src/utils/format.js'

describe('daysUntil', () => {
  it('returns null for empty string', () => {
    expect(daysUntil('')).toBeNull()
  })
  it('parses ISO date strings', () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    expect(daysUntil(future)).toBeGreaterThan(0)
  })
  it('parses "Month YYYY" format', () => {
    expect(daysUntil('January 2099')).toBeGreaterThan(0)
  })
})

describe('formatStatus', () => {
  it('maps INTERESTED → Interested', () => {
    expect(formatStatus('INTERESTED')).toBe('Interested')
  })
  it('maps PREPARING_DOCUMENTS → Preparing', () => {
    expect(formatStatus('PREPARING_DOCUMENTS')).toBe('Preparing')
  })
  it('maps SUBMITTED → Submitted', () => {
    expect(formatStatus('SUBMITTED')).toBe('Submitted')
  })
  it('defaults unknown to Interested', () => {
    expect(formatStatus('UNKNOWN_VALUE')).toBe('Interested')
  })
})

describe('toBackendStatus', () => {
  it('maps Preparing → PREPARING_DOCUMENTS', () => {
    expect(toBackendStatus('Preparing')).toBe('PREPARING_DOCUMENTS')
  })
})

describe('slugify', () => {
  it('lowercases and replaces spaces', () => {
    expect(slugify('Turkey Scholarship')).toBe('turkey-scholarship')
  })
  it('strips accents', () => {
    expect(slugify('Türkiye Bursları')).toBe('turkiye-burslari')
  })
})
