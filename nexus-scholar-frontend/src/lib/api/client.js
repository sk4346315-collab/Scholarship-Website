const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let _access = null
let _refresh = null
let _refreshing = null

export const tokenStore = {
  set: (a, r) => { _access = a; _refresh = r },
  clear: () => { _access = null; _refresh = null },
  get: () => _access,
  has: () => !!_access,
}

export class ApiError extends Error {
  constructor(status, msg) {
    super(msg)
    this.status = status
    this.name = 'ApiError'
  }
}

async function doRefresh() {
  if (!_refresh) return false
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: _refresh }),
    })
    if (!res.ok) return false
    const data = await res.json()
    tokenStore.set(data.accessToken, data.refreshToken)
    return true
  } catch { return false }
}

async function req(path, opts = {}, retry = true) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (_access) headers['Authorization'] = `Bearer ${_access}`

  const res = await fetch(`${BASE}${path}`, { ...opts, headers })

  if (res.status === 401 && retry && _refresh) {
    if (!_refreshing) _refreshing = doRefresh().finally(() => { _refreshing = null })
    const ok = await _refreshing
    if (ok) return req(path, opts, false)
    tokenStore.clear()
    window.dispatchEvent(new Event('nexus:logout'))
    throw new ApiError(401, 'Session expired. Please log in again.')
  }

  const ct = res.headers.get('content-type') || ''
  const body = ct.includes('json') ? await res.json() : await res.text()
  if (!res.ok) throw new ApiError(res.status, typeof body === 'object' ? body.message : body)
  return body
}

export const api = {
  get:    (p, o = {}) => req(p, { method: 'GET', ...o }),
  post:   (p, b, o = {}) => req(p, { method: 'POST', body: JSON.stringify(b), ...o }),
  patch:  (p, b, o = {}) => req(p, { method: 'PATCH', body: JSON.stringify(b), ...o }),
  delete: (p, o = {}) => req(p, { method: 'DELETE', ...o }),
}
