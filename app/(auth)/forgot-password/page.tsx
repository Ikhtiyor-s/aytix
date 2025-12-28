'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'
import { authService } from '@/services/auth'

type AuthMethod = 'telegram' | 'email'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [step, setStep] = useState(1) // 1: Method tanlash, 2: OTP kiritish, 3: Yangi parol
  const [authMethod, setAuthMethod] = useState<AuthMethod>('telegram')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', '']) // 6 xonali OTP
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpTimeLeft, setOtpTimeLeft] = useState(60)
  const [otpAttempts, setOtpAttempts] = useState(3)
  const [isBlocked, setIsBlocked] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [verifiedOtp, setVerifiedOtp] = useState('')
  const [telegramConnected, setTelegramConnected] = useState<boolean | null>(null)
  const [checkingTelegram, setCheckingTelegram] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

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
      setTelegramConnected(null) // Reset telegram status when phone changes
    }
  }

  // Telegram holatini tekshirish
  const checkTelegramStatus = async () => {
    if (phone.length !== selectedCountry.phoneLength) return

    setCheckingTelegram(true)
    try {
      const fullPhone = `${selectedCountry.dialCode}${phone}`
      const response = await authService.checkTelegramStatus(fullPhone)
      setTelegramConnected(response.is_connected)
    } catch (err) {
      setTelegramConnected(false)
    } finally {
      setCheckingTelegram(false)
    }
  }

  // Telefon to'liq kiritilganda Telegram holatini tekshirish
  useEffect(() => {
    if (authMethod === 'telegram' && phone.length === selectedCountry.phoneLength) {
      checkTelegramStatus()
    }
  }, [phone, authMethod, selectedCountry])

  // OTP Timer
  const startOTPTimer = () => {
    setOtpTimeLeft(60)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Step 1: OTP yuborish
  const handleSendOTP = async () => {
    setError('')
    setSuccess('')

    if (authMethod === 'telegram') {
      if (phone.length !== selectedCountry.phoneLength) {
        setError('Telefon raqamni to\'g\'ri kiriting!')
        return
      }
      // Telegram holatini tekshirish
      if (telegramConnected === false) {
        setError('Telegram botga ulanmagan. Avval @aytix_bot ga o\'ting.')
        return
      }
    } else {
      if (!email || !email.includes('@')) {
        setError('Email manzilni to\'g\'ri kiriting!')
        return
      }
    }

    setLoading(true)
    try {
      const fullPhone = authMethod === 'telegram' ? `${selectedCountry.dialCode}${phone}` : undefined
      const response = await authService.requestOTP({
        method: authMethod,
        phone: fullPhone,
        email: authMethod === 'email' ? email : undefined,
      })

      if (response.success) {
        setOtpSent(true)
        setStep(2)
        startOTPTimer()
        setOtpAttempts(3)
        setIsBlocked(false)
        setSuccess(response.message)
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'OTP yuborishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  // OTP input handling
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '')
    const newOtp = paste.slice(0, 6).split('')
    setOtp([...newOtp, '', '', '', '', '', ''].slice(0, 6))
  }

  // Step 2: OTP tasdiqlash
  const handleVerifyOTP = async () => {
    if (isBlocked) return

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('OTP kodni to\'liq kiriting!')
      return
    }

    setLoading(true)
    setError('')
    try {
      const fullPhone = authMethod === 'telegram' ? `${selectedCountry.dialCode}${phone}` : undefined
      const response = await authService.verifyOTP({
        method: authMethod,
        phone: fullPhone,
        email: authMethod === 'email' ? email : undefined,
        otp_code: otpCode,
      })

      if (response.success) {
        setVerifiedOtp(otpCode)
        setStep(3)
        setSuccess('OTP kod tasdiqlandi!')
        setError('')
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail
      const errorMsg = typeof detail === 'string' ? detail : 'OTP tasdiqlashda xatolik'
      setError(errorMsg)

      // Urinishlar sonini yangilash
      if (errorMsg.includes('urinish qoldi')) {
        const match = errorMsg.match(/(\d+) ta urinish/)
        if (match) {
          setOtpAttempts(parseInt(match[1]))
        }
      }

      // Bloklangan bo'lsa
      if (err.response?.status === 429) {
        setIsBlocked(true)
      }

      setOtp(['', '', '', '', '', ''])
      document.getElementById('forgot-otp-0')?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Qayta yuborish
  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', ''])
    setError('')
    setSuccess('')
    await handleSendOTP()
  }

  // Step 3: Parolni yangilash
  const handleResetPassword = async () => {
    setError('')

    // Parol validatsiyasi
    if (newPassword.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak!')
      return
    }

    const hasUpper = /[A-Z]/.test(newPassword)
    const hasLower = /[a-z]/.test(newPassword)
    const hasDigit = /\d/.test(newPassword)

    if (!hasUpper || !hasLower || !hasDigit) {
      setError('Parolda kamida bitta katta harf, kichik harf va raqam bo\'lishi kerak!')
      return
    }

    if (newPassword !== newPasswordConfirm) {
      setError('Parollar mos kelmayapti!')
      return
    }

    setLoading(true)
    try {
      const fullPhone = authMethod === 'telegram' ? `${selectedCountry.dialCode}${phone}` : undefined
      const response = await authService.resetPassword({
        method: authMethod,
        phone: fullPhone,
        email: authMethod === 'email' ? email : undefined,
        otp_code: verifiedOtp,
        new_password: newPassword,
        confirm_password: newPasswordConfirm,
      })

      if (response.success) {
        setSuccess('Parol muvaffaqiyatli yangilandi! Login sahifasiga yo\'naltirilmoqda...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Parolni yangilashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
          <h2 className="text-xl font-bold text-slate-900 mb-1">Parolni tiklash</h2>
          <p className="text-slate-500 text-sm">
            {step === 1 && 'Autentifikatsiya usulini tanlang'}
            {step === 2 && 'Tasdiqlash kodini kiriting'}
            {step === 3 && 'Yangi parol yarating'}
          </p>
        </div>

        {/* Step 1: Method tanlash va ma'lumot kiritish */}
        {step === 1 && (
          <div>
            {/* Auth method tanlash */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 mb-2">Tasdiqlash usuli</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('telegram'); setTelegramConnected(null); }}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-xs font-medium ${
                    authMethod === 'telegram'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  Telegram
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-xs font-medium ${
                    authMethod === 'email'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Gmail
                </button>
              </div>
            </div>

            {/* Telefon yoki Email kiritish */}
            {authMethod === 'telegram' ? (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Telefon raqam <span className="text-red-500">*</span>
                  </label>
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

                {/* Telegram holati */}
                {phone.length === selectedCountry.phoneLength && (
                  <div className="mb-3">
                    {checkingTelegram ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Telegram holati tekshirilmoqda...
                      </div>
                    ) : telegramConnected === true ? (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Telegram botga ulangan. OTP kod yuborishingiz mumkin.
                      </div>
                    ) : telegramConnected === false ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2 text-xs text-amber-800 mb-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="font-medium mb-1">Telegram botga ulanmagan</p>
                            <p className="text-amber-700">OTP olish uchun avval Telegram botga ulaning:</p>
                          </div>
                        </div>
                        <ol className="text-xs text-amber-700 space-y-1 ml-6 list-decimal mb-2">
                          <li>Telegramda <span className="font-semibold">@aytixuz_bot</span> ga o'ting</li>
                          <li><span className="font-semibold">/start</span> bosing</li>
                          <li>"Raqamni yuborish" tugmasini bosing</li>
                          <li>Shu yerga qaytib, qayta urinib ko'ring</li>
                        </ol>
                        <a
                          href="https://t.me/aytixuz_bot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                          </svg>
                          @aytixuz_bot ga o'tish
                        </a>
                        <button
                          onClick={checkTelegramStatus}
                          className="ml-3 text-xs text-slate-600 hover:text-slate-800 underline"
                        >
                          Qayta tekshirish
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email manzil <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-xs"
                  required
                />
              </div>
            )}

            {error && (
              <div className="mb-2 bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-lg text-xs text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOTP}
              disabled={loading || (authMethod === 'telegram' && telegramConnected === false)}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2 rounded-xl transition-all hover:scale-[1.02] mb-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Yuborilmoqda...' : 'OTP kod yuborish'}
            </button>

            <Link
              href="/login"
              className="block text-center text-xs text-slate-500 hover:text-slate-700"
            >
              Orqaga qaytish
            </Link>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div>
            <div className="text-center mb-4">
              <p className="text-xs text-slate-600">
                {authMethod === 'telegram'
                  ? `Telegram orqali ${selectedCountry.dialCode} ${formatPhoneNumber(phone)} raqamiga kod yuborildi`
                  : `${email} manziliga kod yuborildi`}
              </p>
              {authMethod === 'telegram' && (
                <p className="text-xs text-indigo-600 mt-1">
                  @aytix_bot dan xabarni tekshiring
                </p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex gap-1.5 justify-center mb-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`forgot-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOTPChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={index === 0 ? handleOTPPaste : undefined}
                    disabled={isBlocked || loading}
                    className="w-9 h-10 text-center text-base font-bold border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              <div className="text-center mb-3">
                <div className="text-lg font-bold text-indigo-600 mb-1">{formatTime(otpTimeLeft)}</div>
                <p className="text-xs text-slate-500">{otpAttempts} ta urinish qoldi</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs text-center">
                  {error}
                </div>
              )}

              {success && !error && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-3 text-xs text-center">
                  {success}
                </div>
              )}

              {isBlocked && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg mb-3 text-xs text-center">
                  Hisob bloklangan. 15 daqiqadan keyin qayta urinib ko'ring.
                </div>
              )}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={isBlocked || loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2 rounded-xl transition-all hover:scale-[1.02] mb-2 disabled:opacity-50 text-xs"
            >
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={otpTimeLeft > 0 || isBlocked || loading}
              className="w-full border-2 border-slate-200 text-slate-700 font-medium py-2 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              Qayta yuborish
            </button>

            <button
              onClick={() => { setStep(1); setError(''); setSuccess(''); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700 mt-2"
            >
              Orqaga
            </button>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div>
            {/* Parol talablari */}
            <div className="mb-3 p-2.5 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-700 mb-1.5">Parol talablari:</p>
              <ul className="text-xs text-slate-500 space-y-0.5">
                <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                  {newPassword.length >= 8 ? '✓' : '•'} Kamida 8 ta belgi
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                  {/[A-Z]/.test(newPassword) ? '✓' : '•'} Kamida bitta katta harf
                </li>
                <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
                  {/[a-z]/.test(newPassword) ? '✓' : '•'} Kamida bitta kichik harf
                </li>
                <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>
                  {/\d/.test(newPassword) ? '✓' : '•'} Kamida bitta raqam
                </li>
              </ul>
            </div>

            <div className="mb-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Yangi parol <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Yangi parol"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Parolni tasdiqlang <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Parolni qayta kiriting"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className={`w-full px-2.5 py-2 pr-9 border-2 rounded-xl outline-none transition-all text-xs ${
                    newPasswordConfirm && newPassword !== newPasswordConfirm
                      ? 'border-red-300 focus:border-red-500'
                      : newPasswordConfirm && newPassword === newPasswordConfirm
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? (
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
              {/* Parollar mosligi ko'rsatkichi */}
              {newPasswordConfirm && (
                <div className={`mt-1 text-xs flex items-center gap-1 ${
                  newPassword === newPasswordConfirm ? 'text-green-600' : 'text-red-600'
                }`}>
                  {newPassword === newPasswordConfirm ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Parollar mos keldi
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Parollar mos kelmayapti
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs text-center">
                {success}
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 text-xs"
            >
              {loading ? 'Yangilanmoqda...' : 'Parolni yangilash'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
