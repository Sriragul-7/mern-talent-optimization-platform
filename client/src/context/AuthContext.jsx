import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sb-user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('sb-token') || null)

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('sb-user', JSON.stringify(userData))
    localStorage.setItem('sb-token', authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sb-user')
    localStorage.removeItem('sb-token')
  }

  const updateUser = (updatedFields) => {
    const merged = { ...user, ...updatedFields }
    setUser(merged)
    localStorage.setItem('sb-user', JSON.stringify(merged))
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
