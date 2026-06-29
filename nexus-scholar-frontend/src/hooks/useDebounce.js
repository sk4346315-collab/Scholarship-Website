import { useState, useEffect } from 'react'

/**
 * Debounces a value — only updates after the user stops typing for `delay` ms.
 * Use for search inputs to avoid firing API calls on every keystroke.
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 400)
 * useEffect(() => { if (debouncedQuery) doSearch(debouncedQuery) }, [debouncedQuery])
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
