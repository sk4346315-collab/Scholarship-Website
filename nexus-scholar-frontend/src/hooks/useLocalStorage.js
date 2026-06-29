import { useState, useEffect } from 'react'

/**
 * Persists state to localStorage so it survives page refreshes.
 * Falls back gracefully if localStorage is unavailable.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark')
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write errors (private mode, storage full)
    }
  }, [key, value])

  const remove = () => {
    try { window.localStorage.removeItem(key) } catch {}
    setValue(initialValue)
  }

  return [value, setValue, remove]
}
