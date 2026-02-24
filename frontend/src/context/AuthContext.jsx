import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      return data.user
    } catch (err) {
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    const initUser = async () => {
      await refreshUser()
      setLoading(false)
    }
    initUser()
  }, [])

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
