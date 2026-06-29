import { useState, useCallback, useMemo } from 'react'
import { aiApi } from '../../lib/api/ai.api.js'
import { scholarshipsApi } from '../../lib/api/scholarships.api.js'
import { SEED_SCHOLARSHIPS } from '../../data/seed.js'

const FILTER_DEFAULTS = {
  ieltsOnly: true,
  funding:   'ALL',
  tier:      'ALL',
  field:     'ALL',
}

/**
 * Central hook for scholarship discovery state.
 * Manages: seed data, API search results, filters, loading, errors.
 *
 * @returns {object} { scholarships, filters, setFilter, resetFilters,
 *                     search, isSearching, searchError, hasSearched }
 */
export function useScholarships() {
  const [apiResults, setApiResults]   = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [filters, setFilters]         = useState(FILTER_DEFAULTS)

  // Merged + filtered list (seed always shown, API results appended)
  const scholarships = useMemo(() => {
    const seed = SEED_SCHOLARSHIPS.map(s => ({ ...s, _source: 'seed' }))
    const api  = apiResults.map(s => ({ ...s, _source: 'api' }))
    const combined = hasSearched
      ? [...seed, ...api.filter(a => !seed.find(s => s.name === a.name))]
      : seed

    return combined
      .filter(s => !filters.ieltsOnly || !s.ieltsRequired)
      .filter(s => filters.funding === 'ALL' || s.funding === filters.funding)
      .filter(s => filters.tier    === 'ALL' || s.tier    === filters.tier)
      .filter(s => filters.field   === 'ALL' || !s.fields || s.fields.includes(filters.field))
      .sort((a, b) => (b.suitability || 0) - (a.suitability || 0))
  }, [apiResults, filters, hasSearched])

  const search = useCallback(async (query) => {
    const q = (query || '').trim() || 'fully funded CS AI bachelor Pakistan no IELTS 2026'
    setIsSearching(true)
    setSearchError(null)

    try {
      const results = await aiApi.search(q)
      setApiResults(Array.isArray(results) ? results : [])
      setHasSearched(true)
    } catch (e) {
      setSearchError(e.message || 'Search failed')
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(FILTER_DEFAULTS)
    setApiResults([])
    setHasSearched(false)
    setSearchError(null)
  }, [])

  return {
    scholarships,
    filters,
    setFilter,
    resetFilters,
    search,
    isSearching,
    searchError,
    hasSearched,
  }
}
