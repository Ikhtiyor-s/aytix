'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import Link from 'next/link'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'

export default function RegisterPage() {
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.firstName.trim()) {
      setError('Ismingizni kiriting!')
      return
    }
    if (!formData.lastName.trim()) {
      setError('Familiyangizni kiriting!')
      return
    }
    if (formData.phone.length !== selectedCountry.phoneLength) {
      setError(`Telefon raqam ${selectedCountry.phoneLength} ta raqamdan iborat bo'lishi kerak!`)
      return
    }
    if (formData.password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!')
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Parollar mos kelmayapti!')
      return
    }

    try {
      setLoading(true)
      setError('')
      // Register user
      const email = `${formData.phone}@temp.uz`
      const fullName = `${formData.firstName} ${formData.lastName}`
      const username = `${formData.firstName.toLowerCase()}${formData.phone.slice(-4)}`
      await authService.register({
        email,
        username,
        password: formData.password,
        full_name: fullName,
      })
      router.push('/login')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ro\'yxatdan o\'tishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Ro'yxatdan o'tish</h2>
          <p className="text-slate-600">Yangi akkaunt yarating</p>
        </div>

        <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ism</label>
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Familiya</label>
                <input
                  type="text"
                  placeholder="Familiyangiz"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon raqam</label>
              <div className="relative flex">
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                />
                <input
                  type="tel"
                  placeholder={selectedCountry.placeholder}
                  maxLength={selectedCountry.phoneLength}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-r-2xl outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parol</label>
              <input
                type="password"
                placeholder="Kamida 6 ta belgi"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parolni tasdiqlang</label>
              <input
                type="password"
                placeholder="Parolni qayta kiriting"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-2xl transition-all hover:scale-105 mb-4 disabled:opacity-50"
            >
              {loading ? 'Ro\'yxatdan o\'tilmoqda...' : 'Ro\'yxatdan o\'tish'}
            </button>

            <p className="text-center text-sm text-slate-600">
              Akkauntingiz bormi?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Kirish
              </Link>
            </p>
          </div>
      </div>
    </div>
  )
}
