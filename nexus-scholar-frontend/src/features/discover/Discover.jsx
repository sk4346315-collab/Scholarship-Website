import { useState, useMemo, useCallback } from 'react'
import ScholarCard from '../../components/scholarship/ScholarCard.jsx'
import { SEED_SCHOLARSHIPS } from '../../data/seed.js'
import { aiApi } from '../../lib/api/ai.api.js'

const BG = '#080E1A', SU = '#0F1929', BO = '#1E3352', TX = '#E2E8F0', MU = '#64748B', AC = '#06B6D4'

const CHIPS = [
  'Fully funded CS bachelor no IELTS 2026',
  'Türkiye Bursları computer science 2026',
  'Hungary Stipendium CS deadline 2026',
  'China CSC Pakistan no IELTS bachelor',
  'South Korea KGSP CS undergraduate 2026',
  'Malaysia MIS computer science 2026',
]

const FILTERS_DEFAULT = { ieltsOnly: true, funding: 'ALL', tier: 'ALL' }

export default function Discover({ tracker, onAddTrack }) {
  const [apiResults, setApiResults]     = useState([])
  const [query, setQuery]               = useState('')
  const [searching, setSearching]       = useState(false)
  const [searchErr, setSearchErr]       = useState(null)
  const [usedApi, setUsedApi]           = useState(false)
  const [filters, setFilters]           = useState(FILTERS_DEFAULT)

  const doSearch = useCallback(async (customQ) => {
    const q = customQ || query.trim() || 'fully funded CS AI bachelor Pakistan no IELTS 2025 2026'
    setSearching(true); setSearchErr(null); setApiResults([]); setUsedApi(true)
    try {
      const results = await aiApi.search(q)
      setApiResults(results)
    } catch (e) {
      setSearchErr(e.message || 'Search failed. Showing local database.')
    } finally {
      setSearching(false)
    }
  }, [query])

  const all = useMemo(() => {
    const seed = SEED_SCHOLARSHIPS.map(s => ({ ...s, _seed: true }))
    const api  = apiResults.map(s => ({ ...s, _api: true }))
    const combined = usedApi
      ? [...seed, ...api.filter(a => !seed.find(s => s.name === a.name))]
      : seed
    return combined
      .filter(s => !filters.ieltsOnly   || !s.ieltsRequired)
      .filter(s => filters.funding === 'ALL' || s.funding === filters.funding)
      .filter(s => filters.tier    === 'ALL' || s.tier    === filters.tier)
      .sort((a, b) => (b.suitability || 0) - (a.suitability || 0))
  }, [apiResults, filters, usedApi])

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 20, alignItems: 'start' }}>

      {/* Sidebar filters */}
      <div style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 14, padding: 16, position: 'sticky', top: 72 }}>
        <div style={{ fontSize: 9, color: MU, letterSpacing: 2, marginBottom: 14, fontFamily: 'monospace' }}>FILTERS</div>

        {/* IELTS toggle */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: MU, letterSpacing: 1.5, marginBottom: 8 }}>ENGLISH REQ</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div onClick={() => setFilter('ieltsOnly', !filters.ieltsOnly)}
              style={{ width: 36, height: 20, borderRadius: 10, background: filters.ieltsOnly ? '#10B981' : BO, position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: filters.ieltsOnly ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: 11, color: filters.ieltsOnly ? '#10B981' : MU, fontWeight: 600 }}>
              {filters.ieltsOnly ? '✓ IELTS-Free' : 'All'}
            </span>
          </label>
        </div>

        {/* Funding */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: MU, letterSpacing: 1.5, marginBottom: 7 }}>FUNDING</div>
          {['ALL', 'Fully Funded', 'Tuition + Stipend'].map(f => (
            <button key={f} onClick={() => setFilter('funding', f)}
              style={{ display: 'block', width: '100%', background: filters.funding === f ? '#1E3A8A' : 'transparent', border: `1px solid ${filters.funding === f ? '#2563EB' : BO}`, borderRadius: 7, padding: '6px 10px', marginBottom: 5, fontSize: 11, color: filters.funding === f ? '#BAE6FD' : MU, cursor: 'pointer', textAlign: 'left', fontWeight: filters.funding === f ? 700 : 400 }}>
              {f === 'ALL' ? '💰 All Funding' : f}
            </button>
          ))}
        </div>

        {/* Tier */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: MU, letterSpacing: 1.5, marginBottom: 7 }}>TIER</div>
          {[['ALL', '🌍 All'], ['ALPHA', '⭐ ALPHA'], ['BETA', '🔷 BETA'], ['GAMMA', '🔹 GAMMA']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter('tier', v)}
              style={{ display: 'block', width: '100%', background: filters.tier === v ? '#1E3A8A' : 'transparent', border: `1px solid ${filters.tier === v ? '#2563EB' : BO}`, borderRadius: 7, padding: '6px 10px', marginBottom: 5, fontSize: 11, color: filters.tier === v ? '#BAE6FD' : MU, cursor: 'pointer', textAlign: 'left', fontWeight: filters.tier === v ? 700 : 400 }}>
              {l}
            </button>
          ))}
        </div>

        <button onClick={() => { setFilters(FILTERS_DEFAULT); setUsedApi(false); setApiResults([]) }}
          style={{ width: '100%', background: 'transparent', border: `1px solid ${BO}`, borderRadius: 7, padding: '7px', fontSize: 10, color: MU, cursor: 'pointer', letterSpacing: 1 }}>
          ↺ Reset
        </button>
      </div>

      {/* Main area */}
      <div>
        {/* Search bar */}
        <div style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: AC, animation: 'glow 2s infinite' }} />
            <span style={{ fontSize: 9, color: MU, letterSpacing: 2.5, fontFamily: 'monospace' }}>
              AI-POWERED LIVE SEARCH · {all.length} SCHOLARSHIPS SHOWN
            </span>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="e.g. fully funded CS no IELTS Turkey 2026..."
              style={{ flex: 1, background: BG, border: `1px solid ${BO}`, borderRadius: 9, padding: '10px 14px', color: TX, fontSize: 13 }}
            />
            <button onClick={() => doSearch()} disabled={searching}
              style={{ background: searching ? '#0A2535' : '#0E7490', color: '#E0F2FE', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 12, fontWeight: 800, cursor: searching ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
              {searching
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 12, height: 12, border: '2px solid #67E8F9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Scanning...
                  </span>
                : '⚡ AI Search'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 11 }}>
            {CHIPS.map(c => (
              <button key={c} onClick={() => { setQuery(c); doSearch(c) }}
                style={{ background: BG, border: `1px solid ${BO}`, borderRadius: 18, padding: '4px 11px', fontSize: 10, color: MU, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.color = '#93C5FD' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BO; e.currentTarget.style.color = MU }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {searchErr && (
          <div style={{ background: '#1A0608', border: '1px solid #7F1D1D', borderRadius: 10, padding: '11px 16px', marginBottom: 16, color: '#FCA5A5', fontSize: 12 }}>
            ⚠️ {searchErr}
          </div>
        )}

        {/* Loading skeletons */}
        {searching && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: SU, border: `1px solid ${BO}`, borderRadius: 14, padding: 18, minHeight: 260 }}>
                {[75,55,100,40,70,50].map((w,j) => (
                  <div key={j} style={{ height: j===0?17:12, width:`${w}%`, background: BO, borderRadius: 4, marginBottom: 12, opacity: 0.5, animation: 'glow 1.5s infinite' }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!searching && all.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: MU, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 14 }}>
              {all.length} RESULTS · SORTED BY MATCH SCORE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
              {all.map((s, i) => (
                <div key={s.id || s.name} style={{ animation: `fadeIn 0.25s ease ${i*0.05}s both` }}>
                  <ScholarCard s={s} onTrack={onAddTrack} tracked={tracker.some(t => t.id===s.id || t.name===s.name)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!searching && all.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔎</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TX }}>No results match current filters</div>
            <div style={{ fontSize: 12, color: MU, marginTop: 6 }}>Try relaxing filters or click Reset.</div>
          </div>
        )}
      </div>
    </div>
  )
}
