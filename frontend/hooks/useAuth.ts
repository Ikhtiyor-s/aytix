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
        // API dan foydalanuvchi ma'lumotlarini olish
        const apiUser = await authService.getCurrentUser()

        // localStorage dan qo'shimcha ma'lumotlarni olish (profil rasmi, ism, familiya)
        const savedProfile = localStorage.getItem(USER_STORAGE_KEY)
        const profileData = savedProfile ? JSON.parse(savedProfile) : {}

        // Ma'lumotlarni birlashtirish - localStorage dagi ma'lumotlar ustunlik qiladi
        const mergedUser = {
          ...apiUser,
          ...profileData
        }

        setUser(mergedUser)
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

    // localStorage ga saqlash (profil ma'lumotlarni)
    const profileData = {
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      username: newUser.username,
      email: newUser.email,
      profile_image: newUser.profile_image
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profileData))
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


