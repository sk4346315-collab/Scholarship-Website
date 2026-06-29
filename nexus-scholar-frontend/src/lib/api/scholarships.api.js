import { api } from './client.js'

export const scholarshipsApi = {
  list: (filters = {}, page = 1, limit = 20) => {
    const params = new URLSearchParams()
    if (filters.ieltsRequired === false) params.set('ieltsRequired', 'false')
    if (filters.acceptsMoi)   params.set('acceptsMoi', 'true')
    if (filters.countries?.length)  params.set('countries', filters.countries.join(','))
    if (filters.tiers?.length)      params.set('tiers', filters.tiers.join(','))
    if (filters.fields?.length)     params.set('fields', filters.fields.join(','))
    if (filters.minScore)           params.set('minScore', filters.minScore)
    params.set('page', page)
    params.set('limit', limit)
    return api.get(`/api/scholarships?${params}`)
  },

  bySlug: (slug) => api.get(`/api/scholarships/${slug}`),

  calendar: (days = 180) => api.get(`/api/scholarships/calendar?days=${days}`),
}
