'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CountrySelector from '@/components/CountrySelector'
import { Country, defaultCountry } from '@/lib/countries'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpTimeLeft, setOtpTimeLeft] = useState(60)
  const [otpAttempts, setOtpAttempts] = useState(3)
  const [isBlocked, setIsBlocked] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  // Step 1: Phone Number
  const handleSendOTP = () => {
    if (phone.length !== selectedCountry.phoneLength) {
      setError('Telefon raqamni to\'g\'ri kiriting!')
      return
    }
    setError('')
    setStep(2)
    startOTPTimer()
  }

  // Step 2: OTP Verification
  const startOTPTimer = () => {
    setOtpTimeLeft(60)
    const interval = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 3) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text')
    const newOtp = paste.slice(0, 4).split('')
    setOtp([...newOtp, '', '', '', ''].slice(0, 4))
  }

  const handleVerifyOTP = () => {
    if (isBlocked) return

    const otpCode = otp.join('')
    if (otpCode.length !== 4) {
      setError('OTP kodni to\'liq kiriting!')
      return
    }

    // Mock verification - 1234 is correct
    if (otpCode === '1234') {
      setStep(3)
      setError('')
    } else {
      const newAttempts = otpAttempts - 1
      setOtpAttempts(newAttempts)
      setError(`Xato kod! ${newAttempts} ta urinish qoldi`)
      setOtp(['', '', '', ''])
      document.getElementById('forgot-otp-0')?.focus()

      if (newAttempts <= 0) {
        setIsBlocked(true)
        setError('3 marta xato kiritdingiz. 60 daqiqadan keyin qayta urinib ko\'ring.')
      }
    }
  }

  // Step 3: New Password
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!')
      return
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Parollar mos kelmayapti!')
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/login')
    } catch (err: any) {
      setError('Parolni yangilashda xatolik')
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
            {step === 1 && 'Telefon raqamingizni kiriting'}
            {step === 2 && 'Telefon raqamni tasdiqlang'}
            {step === 3 && 'Yangi parol yarating'}
          </p>
        </div>

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon raqam</label>
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
                  className="flex-1 px-3 py-2.5 border-2 border-slate-200 rounded-r-xl outline-none focus:border-indigo-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOTP}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all hover:scale-[1.02] mb-3 text-sm"
            >
              OTP kod yuborish
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
              <p className="text-xs text-slate-600">{selectedCountry.dialCode} {formatPhoneNumber(phone)} raqamiga kod yuborildi</p>
            </div>

            <div className="mb-4">
              <div className="flex gap-2 justify-center mb-3">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`forgot-otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onPaste={index === 0 ? handleOTPPaste : undefined}
                    disabled={isBlocked}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
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

              {isBlocked && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg mb-3 text-xs text-center">
                  3 marta xato kiritdingiz. 60 daqiqadan keyin qayta urinib ko'ring.
                </div>
              )}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={isBlocked}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all hover:scale-[1.02] mb-2 disabled:opacity-50 text-sm"
            >
              Tasdiqlash
            </button>

            <button
              onClick={() => {
                setOtp(['', '', '', ''])
                startOTPTimer()
                setError('')
              }}
              disabled={otpTimeLeft > 0 || isBlocked}
              className="w-full border-2 border-slate-200 text-slate-700 font-medium py-2.5 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Qayta yuborish
            </button>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Yangi parol</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Kamida 6 ta belgi"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm"
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parolni tasdiqlang</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Parolni qayta kiriting"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm"
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
            </div>

            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 text-sm"
            >
              {loading ? 'Yangilanmoqda...' : 'Parolni yangilash'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
