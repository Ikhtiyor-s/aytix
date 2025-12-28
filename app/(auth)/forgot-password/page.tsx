'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [otpTimeLeft, setOtpTimeLeft] = useState(60)
  const [otpAttempts, setOtpAttempts] = useState(3)
  const [isBlocked, setIsBlocked] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: Phone Number
  const handleSendOTP = () => {
    if (phone.length !== 9) {
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
      setError(`❌ Xato kod! ${newAttempts} ta urinish qoldi`)
      setOtp(['', '', '', ''])
      document.getElementById('forgot-otp-0')?.focus()

      if (newAttempts <= 0) {
        setIsBlocked(true)
        setError('🔒 3 marta xato kiritdingiz. 60 daqiqadan keyin qayta urinib ko\'ring.')
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
      // Here you would call API to reset password
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert(`✅ Parol muvaffaqiyatli yangilandi!\n📱 +998 ${phone}\nYangi parol bilan tizimga kiring.`)
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🔑</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Parolni tiklash</h2>
          <p className="text-slate-600">
            {step === 1 && 'Telefon raqamingizni kiriting'}
            {step === 2 && 'Telefon raqamni tasdiqlang'}
            {step === 3 && 'Yangi parol yarating'}
          </p>
        </div>

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon raqam</label>
              <div className="relative flex">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-2 border-r-0 border-slate-200 rounded-l-2xl">
                  <span className="text-lg">🇺🇿</span>
                  <span className="text-slate-600 font-medium">+998</span>
                </div>
                <input
                  type="tel"
                  placeholder="90 123 45 67"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-r-2xl outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOTP}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-2xl transition-all hover:scale-105 mb-3"
            >
              OTP kod yuborish
            </button>

            <Link
              href="/login"
              className="w-full text-slate-600 hover:text-slate-900 font-medium py-2 block text-center"
            >
              ← Orqaga qaytish
            </Link>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">OTP kodni kiriting</h3>
              <p className="text-sm text-slate-600">+998 {phone} raqamiga kod yuborildi</p>
            </div>

            <div className="mb-6">
              <div className="flex gap-3 justify-center mb-4">
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
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-indigo-600 mb-2">{formatTime(otpTimeLeft)}</div>
                <p className="text-sm text-slate-600">{otpAttempts} ta urinish qoldi</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm text-center">
                  {error}
                </div>
              )}

              {isBlocked && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-4 text-sm text-center">
                  🔒 3 marta xato kiritdingiz. 60 daqiqadan keyin qayta urinib ko'ring.
                </div>
              )}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={isBlocked}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-2xl transition-all hover:scale-105 mb-3 disabled:opacity-50"
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
              className="w-full border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-2xl hover:border-indigo-500 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Qayta yuborish
            </button>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Yangi parol</h3>
              <p className="text-sm text-slate-600">Yangi parolni o'rnating</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Yangi parol</label>
              <input
                type="password"
                placeholder="Kamida 6 ta belgi"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parolni tasdiqlang</label>
              <input
                type="password"
                placeholder="Parolni qayta kiriting"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-2xl transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Yangilanmoqda...' : 'Parolni yangilash'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

