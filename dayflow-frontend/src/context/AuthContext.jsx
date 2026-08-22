import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const raw = localStorage.getItem('df_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const signIn = useCallback(async (loginId, password) => {
    const data = await api.post('/auth/signin', { loginId, password })
    localStorage.setItem('df_token', data.token)
    localStorage.setItem('df_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const signUp = useCallback(async (formData) => {
    // formData is a plain object (no file upload on signup for now)
    const data = await api.post('/auth/signup', formData)
    // Don't auto-login after signup — redirect to signin
    return data
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('df_token')
    localStorage.removeItem('df_user')
    setUser(null)
  }, [])

  const changePassword = useCallback(async (newPassword) => {
    await api.post('/auth/change-password', { newPassword })
    // Clear firstLogin flag
    setUser(prev => ({ ...prev, firstLogin: false }))
    const stored = loadUser()
    if (stored) {
      stored.firstLogin = false
      localStorage.setItem('df_user', JSON.stringify(stored))
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook — throws if used outside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
