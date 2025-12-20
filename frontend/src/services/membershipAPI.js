import api from './api'

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload)
}

export const membersAPI = {
  list: (params) => api.get('/members', { params }),
  get: (id) => api.get(`/members/${id}`),
  create: (payload) => api.post('/members', payload),
  update: (id, payload) => api.put(`/members/${id}`, payload),
  remove: (id) => api.delete(`/members/${id}`)
}

export const eventsAPI = {
  list: (params) => api.get('/events', { params }),
  get: (id) => api.get(`/events/${id}`),
  create: (payload) => api.post('/events', payload),
  update: (id, payload) => api.put(`/events/${id}`, payload),
  remove: (id) => api.delete(`/events/${id}`)
}

export const committeesAPI = {
  list: (params) => api.get('/committees', { params }),
  get: (id) => api.get(`/committees/${id}`),
  create: (payload) => api.post('/committees', payload),
  update: (id, payload) => api.put(`/committees/${id}`, payload),
  remove: (id) => api.delete(`/committees/${id}`),
  addMember: (committeeId, memberId) => api.post(`/committees/${committeeId}/members`, { memberId }),
  removeMember: (committeeId, memberId) => api.delete(`/committees/${committeeId}/members/${memberId}`)
}

export const locationsAPI = {
  list: () => api.get('/locations'),
  get: (id) => api.get(`/locations/${id}`),
  create: (payload) => api.post('/locations', payload),
  update: (id, payload) => api.put(`/locations/${id}`, payload),
  remove: (id) => api.delete(`/locations/${id}`)
}

export const paymentsAPI = {
  list: (params) => api.get('/payments', { params }),
  get: (id) => api.get(`/payments/${id}`),
  create: (payload) => api.post('/payments', payload),
  update: (id, payload) => api.put(`/payments/${id}`, payload),
  getStats: (params) => api.get('/payments/stats', { params })
}

export const announcementsAPI = {
  list: (params) => api.get('/announcements', { params }),
  create: (payload) => api.post('/announcements', payload),
  update: (id, payload) => api.put(`/announcements/${id}`, payload),
  archive: (id) => api.put(`/announcements/${id}`, { isActive: false })
}