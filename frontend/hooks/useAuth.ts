'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          authService.logout()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    await authService.login({ email, password })
    const user = await authService.getCurrentUser()
    setUser(user)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return { user, loading, login, logout, isAuthenticated: authService.isAuthenticated() }
}


