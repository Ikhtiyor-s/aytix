/**
 * useAuth Hook - Autentifikatsiya bilan ishlash.
 *
 * Funksiyalar:
 * - Foydalanuvchi ma'lumotlarini olish
 * - Login/Logout
 * - Profil ma'lumotlarini yangilash
 */

'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'
import { User } from '@/types'

const USER_STORAGE_KEY = 'user_profile'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        // API dan foydalanuvchi ma'lumotlarini olish (barcha ma'lumotlar backend dan keladi)
        const apiUser = await authService.getCurrentUser()
        setUser(apiUser)
      } catch {
        authService.logout()
        setUser(null)
      }
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    await authService.login({ email, password })
    await loadUser()
  }

  const logout = () => {
    authService.logout()
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return

    const newUser = { ...user, ...updatedData }
    setUser(newUser)
  }

  return {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: authService.isAuthenticated()
  }
}


