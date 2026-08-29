/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import * as api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('looserfit_user')
    const token = localStorage.getItem('looserfit_token')
    if (savedUser && token) {
      try { return JSON.parse(savedUser) } catch { return null }
    }
    return null
  })
  const [loading] = useState(false)

  const login = async (email, password) => {
    const data = await api.login(email, password)
    localStorage.setItem('looserfit_token', data.token)
    localStorage.setItem('looserfit_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (userData) => {
    const data = await api.register(userData)
    localStorage.setItem('looserfit_token', data.token)
    localStorage.setItem('looserfit_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('looserfit_token')
    localStorage.removeItem('looserfit_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
