'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import Link from 'next/link'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'

type Step = 'info' | 'otp' | 'password'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [sessionId, setSessionId] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    otp: '',
    password: '',
    passwordConfirm: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (step === 'otp' && countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, step])

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
      setFormData({ ...formData, phone: rawValue })
    }
  }

  // 1-qadam: Ma'lumotlarni kiritish va OTP yuborish
  const handleSendOTP = async () => {
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

    try {
      setLoading(true)
      setError('')
      const fullPhone = `${selectedCountry.dialCode}${formData.phone}`
      const response = await authService.registerInit({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: fullPhone,
        email: formData.email || undefined,
      })
      setSessionId(response.session_id)
      setCountdown(response.expires_in)
      setCanResend(false)
      setStep('otp')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d).join(', '))
      } else {
        setError('Xatolik yuz berdi')
      }
    } finally {
      setLoading(false)
    }
  }

  // Qayta OTP yuborish
  const handleResendOTP = async () => {
    try {
      setLoading(true)
      setError('')
      const fullPhone = `${selectedCountry.dialCode}${formData.phone}`
      const response = await authService.registerInit({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: fullPhone,
        email: formData.email || undefined,
      })
      setSessionId(response.session_id)
      setCountdown(response.expires_in)
      setCanResend(false)
      setFormData({ ...formData, otp: '' })
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  // 2-qadam: OTP tasdiqlash
  const handleVerifyOTP = async () => {
    if (formData.otp.length !== 6) {
      setError('Tasdiqlash kodi 6 ta raqamdan iborat bo\'lishi kerak!')
      return
    }

    try {
      setLoading(true)
      setError('')
      await authService.registerVerifyOTP({
        session_id: sessionId,
        otp_code: formData.otp,
      })
      setStep('password')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Tasdiqlash kodi xato')
    } finally {
      setLoading(false)
    }
  }

  // 3-qadam: Parol kiritish va ro'yxatdan o'tish
  const handleComplete = async () => {
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
      await authService.registerComplete({
        session_id: sessionId,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
      })
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Ro\'yxatdan o\'tishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  // Parollar mosligini tekshirish
  const passwordsMatch = formData.password && formData.passwordConfirm && formData.password === formData.passwordConfirm
  const passwordsDontMatch = formData.password && formData.passwordConfirm && formData.password !== formData.passwordConfirm

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
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {step === 'info' && "Ro'yxatdan o'tish"}
            {step === 'otp' && 'Tasdiqlash kodi'}
            {step === 'password' && 'Parol yarating'}
          </h2>
          <p className="text-slate-500 text-sm">
            {step === 'info' && "Ma'lumotlaringizni kiriting"}
            {step === 'otp' && 'Telegram orqali yuborilgan kodni kiriting'}
            {step === 'password' && 'Xavfsiz parol yarating'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className={`w-8 h-1 rounded-full ${step === 'info' ? 'bg-indigo-500' : 'bg-indigo-200'}`} />
          <div className={`w-8 h-1 rounded-full ${step === 'otp' ? 'bg-indigo-500' : step === 'password' ? 'bg-indigo-200' : 'bg-slate-200'}`} />
          <div className={`w-8 h-1 rounded-full ${step === 'password' ? 'bg-indigo-500' : 'bg-slate-200'}`} />
        </div>

        <div>
          {/* Step 1: Ma'lumotlar */}
          {step === 'info' && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ism <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Ismingiz"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Familiya <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Familiyangiz"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Telefon raqam <span className="text-red-500">*</span></label>
                <div className="relative flex">
                  <CountrySelector
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                  />
                  <input
                    type="tel"
                    placeholder="90 123 45 67"
                    value={formatPhoneNumber(formData.phone)}
                    onChange={handlePhoneChange}
                    className="flex-1 px-2.5 py-2 border-2 border-slate-200 rounded-r-xl outline-none focus:border-indigo-500 transition-all text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Telegram botga ulangan raqamingizni kiriting</p>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email <span className="text-slate-400 font-normal">(ixtiyoriy)</span>
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-xs"
                />
              </div>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <>
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Tasdiqlash kodi</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-2.5 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-center text-xl font-bold tracking-widest"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] text-slate-400">
                    {countdown > 0 ? `Kod amal qiladi: ${countdown}s` : 'Kod muddati tugadi'}
                  </p>
                  {canResend && (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Qayta yuborish
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('info')}
                className="text-xs text-slate-500 hover:text-slate-700 mb-3 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Orqaga
              </button>
            </>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <>
              <div className="mb-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Parol <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Kamida 6 ta belgi"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-2.5 py-2 pr-9 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-xs"
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
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Parolni tasdiqlang <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="Parolni qayta kiriting"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    className={`w-full px-2.5 py-2 pr-9 border-2 rounded-xl outline-none transition-all text-xs ${
                      passwordsMatch ? 'border-green-500' : passwordsDontMatch ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPasswordConfirm ? (
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
                {passwordsMatch && (
                  <p className="text-[10px] text-green-600 mt-1">Parollar mos keladi</p>
                )}
                {passwordsDontMatch && (
                  <p className="text-[10px] text-red-600 mt-1">Parollar mos kelmayapti</p>
                )}
              </div>
            </>
          )}

          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs text-center">
              Muvaffaqiyatli ro'yxatdan o'tildi! Login sahifasiga yo'naltirilmoqda...
            </div>
          )}

          <button
            onClick={step === 'info' ? handleSendOTP : step === 'otp' ? handleVerifyOTP : handleComplete}
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2 rounded-xl transition-all hover:scale-[1.02] mb-2 disabled:opacity-50 text-xs"
          >
            {loading ? (
              step === 'info' ? 'Yuborilmoqda...' : step === 'otp' ? 'Tekshirilmoqda...' : 'Yaratilmoqda...'
            ) : success ? (
              'Muvaffaqiyatli!'
            ) : (
              step === 'info' ? 'Tasdiqlash kodini olish' : step === 'otp' ? 'Tasdiqlash' : "Ro'yxatdan o'tish"
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
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
