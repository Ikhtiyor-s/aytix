/**
 * Sozlamalar sahifasi - Foydalanuvchi profilini tahrirlash.
 *
 * Funksiyalar:
 * - Ism va familiyani o'zgartirish
 * - Profil rasmini yuklash
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, loading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: ''
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Autentifikatsiya tekshirish
  useEffect(() => {
    if (!mounted) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Mavjud ma'lumotlarni yuklash
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      })
      setProfileImage(user.profile_image || null)
    }
  }, [mounted, isAuthenticated, user, router])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Fayl turini tekshirish
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Faqat JPEG, PNG yoki WEBP formatdagi rasmlar qabul qilinadi' })
      return
    }

    // Fayl hajmini tekshirish (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Rasm hajmi 5MB dan oshmasligi kerak' })
      return
    }

    setImageFile(file)

    // Preview ko'rsatish
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Backend API ga so'rov yuborish
      const updateData: { first_name?: string; last_name?: string; profile_image?: string } = {}

      if (formData.first_name) {
        updateData.first_name = formData.first_name
      }
      if (formData.last_name) {
        updateData.last_name = formData.last_name
      }
      if (profileImage) {
        updateData.profile_image = profileImage
      }

      // API ga yuborish
      const updatedUserFromApi = await authService.updateProfile(updateData)

      // Local state ni yangilash
      if (typeof updateUser === 'function') {
        updateUser(updatedUserFromApi)
      }

      setMessage({ type: 'success', text: 'Ma\'lumotlar muvaffaqiyatli saqlandi!' })

      // Sahifani qayta yuklash - barcha componentlarni yangilash uchun
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error('Settings update error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  // Server-side yoki mount bo'lmagan holat yoki auth loading - loading ko'rsatish
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2 mb-3 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Orqaga
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Sozlamalar</h1>
          <p className="text-slate-600 mt-1 text-sm">Profil ma'lumotlaringizni tahrirlang</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profil rasmi */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Profil rasmi</h2>
            <div className="flex items-center gap-4">
              <div
                onClick={handleImageClick}
                className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-100 transition-all"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/aytixlogo.png"
                    alt="AyTix"
                    className="w-full h-full object-contain p-1"
                  />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Rasm yuklash
                </button>
                <p className="text-xs text-slate-500 mt-1">
                  JPEG, PNG yoki WEBP. Maksimum 5MB.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Shaxsiy ma'lumotlar */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Shaxsiy ma'lumotlar</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Ismingiz"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Familiya
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Familiyangiz"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Xabar */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Saqlash tugmasi */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
