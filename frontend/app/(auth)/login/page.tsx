'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'

export default function LoginPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Phone number ni email formatiga o'zgartirish (backend email kutadi)
      const email = `${phone}@temp.uz`
      await login(email, password)
      router.push('/marketplace')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Kirish muvaffaqiyatsiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-6 pt-24">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img
              src="/aytix_logo.png"
              alt="AyTix Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Tizimga kirish</h2>
          <p className="text-slate-600">Marketplace platformasiga xush kelibsiz</p>
        </div>

        <form onSubmit={handleSubmit}>
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
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-r-2xl outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Parol</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all"
              required
            />
            <Link
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
            >
              Parolni unutdingizmi?
            </Link>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-2xl transition-all hover:scale-105 mb-4 disabled:opacity-50"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>

          <p className="text-center text-sm text-slate-600">
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
