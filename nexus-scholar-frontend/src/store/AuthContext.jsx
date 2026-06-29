import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../lib/api/auth.api.js'
import { tokenStore } from '../lib/api/client.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)   // true while checking session

  // On mount: try to restore session from stored refresh token
  useEffect(() => {
    const saved = sessionStorage.getItem('nexus_refresh')
    if (saved) {
      tokenStore.set(sessionStorage.getItem('nexus_access'), saved)
      authApi.me()
        .then(setUser)
        .catch(() => { tokenStore.clear(); sessionStorage.clear() })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    // Listen for forced logout (401 after refresh fail)
    const onLogout = () => { setUser(null); sessionStorage.clear() }
    window.addEventListener('nexus:logout', onLogout)
    return () => window.removeEventListener('nexus:logout', onLogout)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    setUser(data.user)
    // Persist tokens in sessionStorage (cleared when tab closes)
    sessionStorage.setItem('nexus_access', data.accessToken)
    sessionStorage.setItem('nexus_refresh', data.refreshToken)
    return data
  }, [])

  const register = useCallback(async (email, password, fullName) => {
    const data = await authApi.register(email, password, fullName)
    setUser(data.user)
    sessionStorage.setItem('nexus_access', data.accessToken)
    sessionStorage.setItem('nexus_refresh', data.refreshToken)
    return data
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
    sessionStorage.clear()
  }, [])

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
