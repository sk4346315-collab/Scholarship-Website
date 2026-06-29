import { api, tokenStore } from './client.js'

export const authApi = {
  register: async (email, password, fullName) => {
    const data = await api.post('/api/auth/register', { email, password, fullName })
    tokenStore.set(data.accessToken, data.refreshToken)
    return data
  },

  login: async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password })
    tokenStore.set(data.accessToken, data.refreshToken)
    return data
  },

  logout: () => tokenStore.clear(),

  me: () => api.get('/api/auth/me'),
}
