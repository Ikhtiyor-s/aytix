/**
 * useAuth Hook - Autentifikatsiya bilan ishlash.
 */

'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'
import { User } from '@/types'

const USER_STORAGE_KEY = 'user_profile'

// LocalStorage'dan user olish
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// LocalStorage'ga user saqlash
const setStoredUser = (user: User | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

export function useAuth() {
  // Dastlab localStorage'dan user olish - tez yuklanadi
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Avval localStorage'dan olish (tez)
    const storedUser = getStoredUser()
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser)
      setLoading(false)
      // Background'da yangilash
      refreshUser()
    } else if (authService.isAuthenticated()) {
      // Token bor, lekin cached user yo'q - API dan olish
      loadUser()
    } else {
      // Token yo'q
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const apiUser = await authService.getCurrentUser()
      setUser(apiUser)
      setStoredUser(apiUser)
    } catch (error) {
      console.error('Failed to load user:', error)
      setUser(null)
      setStoredUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Background'da user ma'lumotlarini yangilash
  const refreshUser = async () => {
    try {
      const apiUser = await authService.getCurrentUser()
      setUser(apiUser)
      setStoredUser(apiUser)
    } catch {
      // Xato bo'lsa ham davom etamiz - cached user ishlatiladi
    }
  }

  const login = async (phone: string, password: string) => {
    await authService.login({ phone, password })
    await loadUser()
  }

  const logout = () => {
    authService.logout()
    setStoredUser(null)
    setUser(null)
  }

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return

    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    setStoredUser(newUser)
  }

  // isAuthenticated haqiqiy reaktiv qiymat - user yuklanganda yangilanadi
  const isAuthenticated = !!user || authService.isAuthenticated()

  return {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated
  }
}


