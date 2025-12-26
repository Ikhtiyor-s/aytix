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

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: ''
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Autentifikatsiya tekshirish
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Mavjud ma'lumotlarni yuklash
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || ''
      })
      setProfileImage(user.profile_image || null)
    }
  }, [isAuthenticated, user, router])

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
      // TODO: Backend API ga so'rov yuborish
      // Hozircha localStorage da saqlaymiz

      const updatedUser = {
        ...user,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        profile_image: profileImage
      }

      // updateUser funksiyasi mavjud bo'lsa
      if (typeof updateUser === 'function') {
        updateUser(updatedUser)
      } else {
        // Fallback: localStorage ga saqlash
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      setMessage({ type: 'success', text: 'Ma\'lumotlar muvaffaqiyatli saqlandi!' })

      // Sahifani qayta yuklash - barcha componentlarni yangilash uchun
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Orqaga
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Sozlamalar</h1>
          <p className="text-slate-600 mt-2">Profil ma'lumotlaringizni tahrirlang</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profil rasmi */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Profil rasmi</h2>
            <div className="flex items-center gap-6">
              <div
                onClick={handleImageClick}
                className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-indigo-100 transition-all"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/aytix_logo.png"
                    alt="AyTix"
                    className="w-full h-full object-contain p-2"
                  />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Rasm yuklash
                </button>
                <p className="text-sm text-slate-500 mt-2">
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
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Shaxsiy ma'lumotlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ism
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Ismingiz"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Familiya
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Familiyangiz"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Akkaunt ma'lumotlari */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Akkaunt ma'lumotlari</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Foydalanuvchi nomi
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Foydalanuvchi nomi"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Xabar */}
          {message && (
            <div
              className={`p-4 rounded-xl ${
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
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
