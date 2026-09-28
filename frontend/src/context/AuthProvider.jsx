import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMe, login as loginRequest, logout as logoutRequest } from '../service/authService'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authed | guest

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMe()
      setUser(data.user)
      setStatus('authed')
      return data.user
    } catch {
      setUser(null)
      setStatus('guest')
      return null
    }
  }, [])

  // revalidate the cookie on every app load
  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    setUser(data.user)
    setStatus('authed')
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      setStatus('guest')
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authed',
      isLoading: status === 'loading',
      login,
      logout,
      refresh,
    }),
    [user, status, login, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
