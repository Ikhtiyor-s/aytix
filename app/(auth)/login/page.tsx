'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'

// Telegram username - ro'yxatdan o'tgan foydalanuvchilar shu yerga yo'naltiriladi
const TELEGRAM_USERNAME = 'Ikhtiyor_sb'

export default function LoginPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, loading: authLoading } = useAuth()

  // Agar foydalanuvchi allaqachon tizimga kirgan bo'lsa - Telegram ga yo'naltirish
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      window.location.href = `https://t.me/${TELEGRAM_USERNAME}`
    }
  }, [isAuthenticated, authLoading])

  // Telefon raqamni formatlash (94 867 93 00)
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    if (rawValue.length <= selectedCountry.phoneLength) {
      setPhone(rawValue)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Telefon raqamini to'liq formatda yuborish (mamlakat kodi bilan)
      const fullPhone = `${selectedCountry.dialCode}${phone}`
      await login(fullPhone, password)
      // Muvaffaqiyatli login - Telegram ga yo'naltirish
      window.location.href = `https://t.me/${TELEGRAM_USERNAME}`
    } catch (err: any) {
      const detail = err.response?.data?.detail
      // Xato xabarlarini o'zbek tiliga tarjima qilish
      const translateError = (msg: string): string => {
        const translations: { [key: string]: string } = {
          'Incorrect phone or password': 'Telefon raqam yoki parol noto\'g\'ri',
          'Incorrect email or password': 'Email yoki parol noto\'g\'ri',
          'Invalid credentials': 'Ma\'lumotlar noto\'g\'ri',
          'Inactive user': 'Foydalanuvchi faol emas',
          'User not found': 'Foydalanuvchi topilmadi',
          'Invalid phone number': 'Telefon raqam noto\'g\'ri',
          'Invalid password': 'Parol noto\'g\'ri',
          'Field required': 'Maydon to\'ldirilishi shart',
        }
        return translations[msg] || msg
      }

      if (typeof detail === 'string') {
        setError(translateError(detail))
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => translateError(d.msg || d)).join(', '))
      } else {
        setError('Kirish muvaffaqiyatsiz')
      }
    } finally {
      setLoading(false)
    }
  }

  // Auth yuklanayotganda yoki foydalanuvchi kirgan bo'lsa - loading ko'rsatish
  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3">
            <img
              src="/aytixlogo.png"
              alt="AyTix Logo"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <p className="text-slate-500 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-lg">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3">
            <img
              src="/aytixlogo.png"
              alt="AyTix Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Tizimga kirish</h2>
          <p className="text-slate-500 text-sm">Marketplace platformasiga xush kelibsiz</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">Telefon raqam <span className="text-red-500">*</span></label>
            <div className="relative flex">
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
              <input
                type="tel"
                placeholder="90 123 45 67"
                value={formatPhoneNumber(phone)}
                onChange={handlePhoneChange}
                className="flex-1 px-2.5 py-2 border-2 border-slate-200 rounded-r-xl outline-none focus:border-indigo-500 transition-all text-xs"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">Parol <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2.5 py-2 pr-9 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1.5 inline-block"
            >
              Parolni unutdingizmi?
            </Link>
          </div>

          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2 rounded-xl transition-all hover:scale-[1.02] mb-3 disabled:opacity-50 text-xs"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Akkauntingiz yo'qmi?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
