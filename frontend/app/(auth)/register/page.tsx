'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import Link from 'next/link'
import Image from 'next/image'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'

type Step = 'info' | 'otp'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
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

  // Step 1: Ma'lumotlarni kiritish va OTP yuborish
  const handleSendOTP = async () => {
    // Validatsiya
    if (!formData.firstName.trim()) {
      setError('Ismingizni kiriting!')
      return
    }
    if (!formData.lastName.trim()) {
      setError('Familiyangizni kiriting!')
      return
    }
    if (phone.length !== selectedCountry.phoneLength) {
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
      await authService.sendOTP({
        phone: getFullPhone(),
        purpose: 'register'
      })
      setStep('otp')
      setOtpTimer(60)
      setCanResend(false)
      // Focus first OTP input
      setTimeout(() => otpInputs.current[0]?.focus(), 100)
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

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pastedData.length === 4) {
      setOtp(pastedData.split(''))
      otpInputs.current[3]?.focus()
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
      otpInputs.current[0]?.focus()
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

  // Step 2: OTP ni tasdiqlash va ro'yxatdan o'tish
  const handleVerifyAndRegister = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 4) {
      setError('4 xonali kodni kiriting')
      return
    }

    try {
      setLoading(true)
      setError('')
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
            {step === 'info' && "Ro'yxatdan o'tish"}
            {step === 'otp' && 'Kodni kiriting'}
          </h2>
          <p className="text-slate-500 text-[10px] sm:text-xs">
            {step === 'info' && "Ma'lumotlaringizni kiriting"}
            {step === 'otp' && (
              <>
                <span className="font-medium text-slate-700">{getFullPhone()}</span> raqamiga
                <a
                  href="https://t.me/aytixuz_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-medium ml-1"
                >
                  @aytixuz_bot
                </a>
                {' '}orqali kod yuborildi
              </>
            )}
          </p>
        </div>

        {/* Step 1: Ma'lumotlar */}
        {step === 'info' && (
          <div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2.5 sm:mb-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-1 sm:mb-1.5">Ism <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  autoComplete="off"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white transition-all text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-1 sm:mb-1.5">Familiya <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Familiyangiz"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  autoComplete="off"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white transition-all text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="mb-2.5 sm:mb-3">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-1 sm:mb-1.5">Telefon raqam <span className="text-red-500">*</span></label>
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
                  autoComplete="off"
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-transparent outline-none text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="mb-2.5 sm:mb-3">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-1 sm:mb-1.5">Parol <span className="text-red-500">*</span></label>
              <div className="relative flex items-center w-full border-2 border-slate-200 rounded-lg bg-white focus-within:border-indigo-500 transition-all">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Parolni kiriting"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-transparent outline-none text-xs sm:text-sm"
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

            <div className="mb-2.5 sm:mb-3">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-1 sm:mb-1.5">Parolni tasdiqlang <span className="text-red-500">*</span></label>
              <div className="relative flex items-center w-full border-2 border-slate-200 rounded-lg bg-white focus-within:border-indigo-500 transition-all">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Parolni qayta kiriting"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  autoComplete="new-password"
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-transparent outline-none text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="px-2 sm:px-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswordConfirm ? (
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
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-1.5 sm:py-2 rounded-lg transition-all hover:scale-[1.01] mb-2.5 sm:mb-3 disabled:opacity-50 text-xs sm:text-sm"
            >
              {loading ? 'Yuborilmoqda...' : 'OTP kod olish'}
            </button>

            {/* Telegram bot haqida eslatma */}
            <div className="mb-2.5 sm:mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-2.5">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">
                    OTP kod{' '}
                    <a
                      href="https://t.me/aytixuz_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      @aytixuz_bot
                    </a>
                    {' '}Telegram bot orqali keladi
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <div>
            {/* Telegram bot banner */}
            <div className="mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2.5 sm:p-3 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[10px] sm:text-xs">Telegram botga o'ting</p>
                  <a
                    href="https://t.me/aytixuz_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 text-[10px] sm:text-xs hover:text-white underline"
                  >
                    @aytixuz_bot
                  </a>
                </div>
                <a
                  href="https://t.me/aytixuz_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-blue-600 px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold hover:bg-blue-50 transition-colors"
                >
                  Ochish
                </a>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-1.5 sm:mb-2 text-center">
                4 xonali kodni kiriting
              </label>
              <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
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
                    className="w-10 h-11 sm:w-11 sm:h-12 md:w-12 md:h-14 text-center text-base sm:text-lg font-bold border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="text-center mb-2.5 sm:mb-3">
              {canResend ? (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-[10px] sm:text-xs"
                >
                  Kodni qayta yuborish
                </button>
              ) : (
                <p className="text-slate-500 text-[10px] sm:text-xs">
                  Qayta yuborish: <span className="font-semibold text-indigo-600">{otpTimer}s</span>
                </p>
              )}
            </div>

            {error && (
              <div className="mb-2.5 sm:mb-3 bg-red-50 border border-red-200 text-red-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-2.5 sm:mb-3 bg-green-50 border border-green-200 text-green-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs text-center">
                Muvaffaqiyatli ro'yxatdan o'tdingiz!
              </div>
            )}

            <button
              onClick={handleVerifyAndRegister}
              disabled={loading || otp.join('').length !== 4 || success}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-1.5 sm:py-2 rounded-lg transition-all hover:scale-[1.01] mb-2.5 sm:mb-3 disabled:opacity-50 text-xs sm:text-sm"
            >
              {loading ? 'Tekshirilmoqda...' : success ? 'Muvaffaqiyatli!' : 'Tasdiqlash'}
            </button>

            <button
              onClick={() => { setStep('info'); setError(''); setOtp(['', '', '', '']) }}
              className="w-full text-slate-600 hover:text-slate-800 font-medium py-1 sm:py-1.5 text-[10px] sm:text-xs"
            >
              ← Orqaga
            </button>
          </div>
        )}

        {/* Login link */}
        <p className="text-center text-[10px] sm:text-xs text-slate-500 mt-2 sm:mt-3">
          Akkauntingiz bormi?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
