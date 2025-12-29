'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'
import { authService } from '@/services/auth'

export default function LoginPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Telefon raqamni formatlash (90 123 45 67)
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

  // To'liq telefon raqam
  const getFullPhone = () => `${selectedCountry.dialCode}${phone}`

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (phone.length !== selectedCountry.phoneLength) {
      setError(`Telefon raqam ${selectedCountry.phoneLength} ta raqamdan iborat bo'lishi kerak!`)
      return
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!')
      return
    }

    setLoading(true)

    try {
      // Email formatida telefon raqamni yuborish (backend kutadi)
      const phoneDigits = getFullPhone().replace('+', '')
      const email = `${phoneDigits}@aytix.uz`

      await authService.login({
        email: email,
        password: password
      })

      // Muvaffaqiyatli kirilgandan keyin
      window.location.href = '/marketplace'
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d).join(', '))
      } else {
        setError('Telefon raqam yoki parol noto\'g\'ri')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] p-4 sm:p-5 md:p-6 shadow-lg">
        {/* Logo va sarlavha */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Image
              src="/aytixlogo.png"
              alt="AyTix Logo"
              width={48}
              height={48}
              className="object-contain w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
            />
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-0.5">
            Tizimga kirish
          </h2>
          <p className="text-slate-500 text-[10px] sm:text-xs">
            Marketplace platformasiga xush kelibsiz
          </p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off">
          {/* Telefon raqam */}
          <div className="mb-2.5 sm:mb-3">
            <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-1 sm:mb-1.5">
              Telefon raqam <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center w-full border-2 border-slate-200 rounded-lg bg-white focus-within:border-indigo-500 transition-all">
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
              <input
                type="tel"
                placeholder="90 123 45 67"
                value={formatPhoneNumber(phone)}
                onChange={handlePhoneChange}
                autoComplete="new-password"
                name="phone-login-field"
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-transparent outline-none text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Parol */}
          <div className="mb-2.5 sm:mb-3">
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700">
                Parol <span className="text-red-500">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Parolni unutdingizmi?
              </Link>
            </div>
            <div className="relative flex items-center w-full border-2 border-slate-200 rounded-lg bg-white focus-within:border-indigo-500 transition-all">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Parolni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                name="password-login-field"
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-transparent outline-none text-xs sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-2 sm:px-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-2.5 sm:mb-3 bg-red-50 border border-red-200 text-red-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-1.5 sm:py-2 rounded-lg transition-all hover:scale-[1.01] mb-2.5 sm:mb-3 disabled:opacity-50 text-xs sm:text-sm"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-[10px] sm:text-xs text-slate-500 mt-2 sm:mt-3">
          Akkauntingiz yo'qmi?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </div>
  )
}
