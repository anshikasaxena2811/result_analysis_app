import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
console.log(API_URL)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/profile`, {
        withCredentials: true
      })
      setUser(res.data.data)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const res = await axios.post(`${API_URL}/api/users/login`, credentials, {
        withCredentials: true
      })
      setUser(res.data.data)
      return res.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/api/users/register`, userData, {
        withCredentials: true
      })
      return res.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/users/logout`, {}, {
        withCredentials: true
      })
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}