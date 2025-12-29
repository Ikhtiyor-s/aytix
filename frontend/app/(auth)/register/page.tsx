'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import Link from 'next/link'
import Image from 'next/image'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'

type Step = 'phone' | 'otp' | 'info'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    passwordConfirm: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [otpTimer, setOtpTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])

  // OTP timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (step === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, otpTimer])

  // Telefon raqamni formatlash
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

  // Step 1: Telefon raqamni yuborish
  const handleSendOTP = async () => {
    if (phone.length !== selectedCountry.phoneLength) {
      setError(`Telefon raqam ${selectedCountry.phoneLength} ta raqamdan iborat bo'lishi kerak!`)
      return
    }

    try {
      setLoading(true)
      setError('')
      await authService.sendOTP({
        phone: getFullPhone(),
        purpose: 'register'
      })
      setStep('otp')
      setOtpTimer(60)
      setCanResend(false)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('OTP yuborishda xatolik')
      }
    } finally {
      setLoading(false)
    }
  }

  // OTP input handler
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Avtomatik keyingi inputga o'tish
    if (value && index < 3) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  // Step 2: OTP ni tekshirish
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 4) {
      setError('4 xonali kodni kiriting')
      return
    }

    try {
      setLoading(true)
      setError('')
      await authService.verifyOTP({
        phone: getFullPhone(),
        code: otpCode,
        purpose: 'register'
      })
      setStep('info')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Noto\'g\'ri kod')
      }
    } finally {
      setLoading(false)
    }
  }

  // OTP qayta yuborish
  const handleResendOTP = async () => {
    try {
      setLoading(true)
      setError('')
      await authService.resendOTP({
        phone: getFullPhone(),
        purpose: 'register'
      })
      setOtp(['', '', '', ''])
      setOtpTimer(60)
      setCanResend(false)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Qayta yuborishda xatolik')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Ro'yxatdan o'tish
  const handleRegister = async () => {
    if (!formData.firstName.trim()) {
      setError('Ismingizni kiriting!')
      return
    }
    if (!formData.lastName.trim()) {
      setError('Familiyangizni kiriting!')
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
      const otpCode = otp.join('')
      await authService.phoneRegister({
        phone: getFullPhone(),
        code: otpCode,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
      })
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/marketplace'
      }, 1500)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Ro\'yxatdan o\'tishda xatolik')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[420px] p-5 sm:p-6 md:p-8 shadow-lg">
        {/* Logo va sarlavha */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Image
              src="/aytixlogo.png"
              alt="AyTix Logo"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            {step === 'phone' && "Ro'yxatdan o'tish"}
            {step === 'otp' && 'Kodni kiriting'}
            {step === 'info' && "Ma'lumotlaringiz"}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            {step === 'phone' && 'Telefon raqamingizni kiriting'}
            {step === 'otp' && `${getFullPhone()} raqamiga kod yuborildi`}
            {step === 'info' && "Ro'yxatdan o'tishni yakunlang"}
          </p>
        </div>

        {/* Step 1: Telefon raqam */}
        {step === 'phone' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Telefon raqam</label>
              <div className="relative flex items-center w-full border-2 border-slate-200 rounded-xl bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                />
                <input
                  type="tel"
                  placeholder={selectedCountry.placeholder}
                  value={formatPhoneNumber(phone)}
                  onChange={handlePhoneChange}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] mb-4 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Yuborilmoqda...' : 'Davom etish'}
            </button>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <div>
            <div className="mb-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="text-center mb-4">
              {canResend ? (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Kodni qayta yuborish
                </button>
              ) : (
                <p className="text-slate-500 text-sm">
                  Qayta yuborish: <span className="font-medium text-slate-700">{otpTimer}s</span>
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join('').length !== 4}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] mb-4 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>

            <button
              onClick={() => { setStep('phone'); setError(''); setOtp(['', '', '', '']) }}
              className="w-full text-slate-600 hover:text-slate-800 font-medium py-2 text-sm"
            >
              Orqaga
            </button>
          </div>
        )}

        {/* Step 3: Ma'lumotlar */}
        {step === 'info' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ism</label>
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Familiya</label>
                <input
                  type="text"
                  placeholder="Familiyangiz"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Parol</label>
              <div className="relative flex items-center w-full border-2 border-slate-200 rounded-xl bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Kamida 6 ta belgi"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent outline-none text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 sm:px-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Parolni tasdiqlang</label>
              <div className="relative flex items-center w-full border-2 border-slate-200 rounded-xl bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Parolni qayta kiriting"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent outline-none text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="px-3 sm:px-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswordConfirm ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-center">
                Muvaffaqiyatli ro'yxatdan o'tdingiz!
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] mb-4 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? "Ro'yxatdan o'tilmoqda..." : success ? 'Muvaffaqiyatli!' : "Ro'yxatdan o'tish"}
            </button>
          </div>
        )}

        {/* Login link */}
        <p className="text-center text-xs sm:text-sm text-slate-500">
          Akkauntingiz bormi?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
