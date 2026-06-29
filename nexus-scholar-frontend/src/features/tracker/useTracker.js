import { useState, useCallback } from 'react'
import { usersApi } from '../../lib/api/users.api.js'
import { formatStatus, toBackendStatus, isBackendId } from '../../utils/format.js'

/**
 * Hook that manages the application tracker — both local state and backend sync.
 *
 * @param {boolean} isLoggedIn - whether the user is authenticated
 * @returns {object} tracker state + action functions
 */
export function useTracker(isLoggedIn) {
  const [tracker,   setTracker]   = useState([])
  const [docChecks, setDocChecks] = useState({})  // { itemKey: { docName: bool } }
  const [syncing,   setSyncing]   = useState({})   // { itemKey: bool }

  // ── Load from backend when user logs in ───────────────────────
  const loadFromBackend = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const apps = await usersApi.getApplications()
      const mapped = apps.map(a => ({
        ...a.scholarship,
        id:      a.scholarshipId,
        _appId:  a.id,
        status:  formatStatus(a.status),
        added:   new Date(a.createdAt).toLocaleDateString(),
        docs:    a.scholarship?.docs || [],
      }))
      setTracker(mapped)

      const checks = {}
      apps.forEach(a => { checks[a.scholarshipId] = a.docsChecklist || {} })
      setDocChecks(checks)
    } catch {
      // Fail silently — user still gets in-memory tracker
    }
  }, [isLoggedIn])

  // ── Add a scholarship to the tracker ─────────────────────────
  const addToTracker = useCallback(async (scholarship) => {
    const key = scholarship.id || scholarship.name
    if (tracker.some(t => (t.id || t.name) === key)) return

    const entry = {
      ...scholarship,
      status: 'Interested',
      added:  new Date().toLocaleDateString(),
    }

    // Sync to backend only for real DB scholarships (not local seed)
    if (isLoggedIn && isBackendId(scholarship.id)) {
      try {
        const app = await usersApi.track(scholarship.id)
        entry._appId = app.id
      } catch {}
    }

    setTracker(prev => [...prev, entry])

    // Initialise empty doc checklist
    const initChecks = {}
    ;(scholarship.docs || []).forEach(d => { initChecks[d] = false })
    setDocChecks(prev => ({ ...prev, [key]: initChecks }))
  }, [tracker, isLoggedIn])

  // ── Move to a different status ─────────────────────────────────
  const moveStatus = useCallback(async (item, newStatus) => {
    const key = item.id || item.name
    setTracker(prev => prev.map(t =>
      (t.id || t.name) === key ? { ...t, status: newStatus } : t
    ))

    if (isLoggedIn && item._appId) {
      try { await usersApi.updateStatus(item._appId, toBackendStatus(newStatus)) } catch {}
    }
  }, [isLoggedIn])

  // ── Toggle a single document checkbox ─────────────────────────
  const toggleDoc = useCallback(async (itemKey, doc, value) => {
    const updated = { ...(docChecks[itemKey] || {}), [doc]: value }
    setDocChecks(prev => ({ ...prev, [itemKey]: updated }))

    if (isLoggedIn) {
      const item = tracker.find(t => (t.id || t.name) === itemKey)
      if (item?._appId) {
        setSyncing(prev => ({ ...prev, [itemKey]: true }))
        try { await usersApi.updateDocs(item._appId, updated) } catch {}
        finally { setSyncing(prev => ({ ...prev, [itemKey]: false })) }
      }
    }
  }, [docChecks, tracker, isLoggedIn])

  // ── Remove from tracker ────────────────────────────────────────
  const removeFromTracker = useCallback(async (item) => {
    const key = item.id || item.name
    setTracker(prev => prev.filter(t => (t.id || t.name) !== key))
    setDocChecks(prev => { const n = { ...prev }; delete n[key]; return n })

    if (isLoggedIn && item._appId) {
      try { await usersApi.removeApp(item._appId) } catch {}
    }
  }, [isLoggedIn])

  // ── Helpers ─────────────────────────────────────────────────────
  const isTracked = useCallback((scholarship) => {
    const key = scholarship.id || scholarship.name
    return tracker.some(t => (t.id || t.name) === key)
  }, [tracker])

  const docProgress = useCallback((itemKey, docs = []) => {
    const checks = docChecks[itemKey] || {}
    const done   = docs.filter(d => checks[d]).length
    const total  = docs.length
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [docChecks])

  return {
    tracker, docChecks, syncing,
    loadFromBackend,
    addToTracker,
    moveStatus,
    toggleDoc,
    removeFromTracker,
    isTracked,
    docProgress,
  }
}
