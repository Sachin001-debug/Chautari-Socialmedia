import api from './api'

// The session lives in an httpOnly cookie set by the server, so nothing is
// read from or written to localStorage here.

export const register = (payload) => api.post('/user/register', payload).then((res) => res.data)

export const login = (credentials) => api.post('/user/login', credentials).then((res) => res.data)

export const logout = () => api.post('/user/logout').then((res) => res.data)

export const fetchMe = () => api.get('/user/me').then((res) => res.data)
