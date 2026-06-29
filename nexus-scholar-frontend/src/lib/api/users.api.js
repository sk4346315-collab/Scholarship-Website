import { api } from './client.js'

export const usersApi = {
  updateProfile:  (dto)          => api.patch('/api/users/profile', dto),
  getApplications: ()            => api.get('/api/users/applications'),
  track:          (scholarshipId) => api.post('/api/users/applications', { scholarshipId }),
  updateStatus:   (id, status)   => api.patch(`/api/users/applications/${id}/status`, { status }),
  updateDocs:     (id, checklist) => api.patch(`/api/users/applications/${id}/docs`, { checklist }),
  removeApp:      (id)            => api.delete(`/api/users/applications/${id}`),
  getTimeline:    ()              => api.get('/api/users/timeline'),
}
