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
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6">
      <div className="max-w-md mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 mb-2 sm:mb-3 text-xs sm:text-sm"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Orqaga
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">Sozlamalar</h1>
          <p className="text-slate-600 mt-0.5 text-xs sm:text-sm">Profil ma'lumotlaringizni tahrirlang</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Profil rasmi */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 sm:mb-3">Profil rasmi</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                onClick={handleImageClick}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-100 transition-all"
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
                    className="w-full h-full object-contain p-0.5"
                  />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-indigo-600 text-white text-xs sm:text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Rasm yuklash
                </button>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
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
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 sm:mb-3">Shaxsiy ma'lumotlar</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5 sm:mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Ismingiz"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5 sm:mb-1">
                  Familiya
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Familiyangiz"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Telefon raqam */}
            {(user?.phone || user?.email?.endsWith('@aytix.uz')) && (
              <div className="mt-2 sm:mt-3">
                <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5 sm:mb-1">
                  Telefon raqam
                </label>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+998 {user.phone || user.email?.replace('@aytix.uz', '')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Xabar */}
          {message && (
            <div
              className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
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
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
