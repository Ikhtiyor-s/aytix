'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Country, defaultCountry } from '@/lib/countries'
import { authService } from '@/services/auth'
import StepMethodSelect from './StepMethodSelect'
import StepOtpVerify from './StepOtpVerify'
import StepNewPassword from './StepNewPassword'

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
          <StepMethodSelect
            authMethod={authMethod}
            setAuthMethod={setAuthMethod}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            phone={phone}
            formatPhoneNumber={formatPhoneNumber}
            handlePhoneChange={handlePhoneChange}
            email={email}
            setEmail={setEmail}
            telegramConnected={telegramConnected}
            setTelegramConnected={setTelegramConnected}
            checkingTelegram={checkingTelegram}
            checkTelegramStatus={checkTelegramStatus}
            error={error}
            loading={loading}
            handleSendOTP={handleSendOTP}
          />
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <StepOtpVerify
            authMethod={authMethod}
            dialCode={selectedCountry.dialCode}
            formattedPhone={formatPhoneNumber(phone)}
            email={email}
            otp={otp}
            handleOTPChange={handleOTPChange}
            handleOTPKeyDown={handleOTPKeyDown}
            handleOTPPaste={handleOTPPaste}
            otpTimeLeft={otpTimeLeft}
            formatTime={formatTime}
            otpAttempts={otpAttempts}
            isBlocked={isBlocked}
            error={error}
            success={success}
            loading={loading}
            handleVerifyOTP={handleVerifyOTP}
            handleResendOTP={handleResendOTP}
            onBack={() => { setStep(1); setError(''); setSuccess(''); }}
          />
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <StepNewPassword
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            newPasswordConfirm={newPasswordConfirm}
            setNewPasswordConfirm={setNewPasswordConfirm}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            error={error}
            success={success}
            loading={loading}
            handleResetPassword={handleResetPassword}
          />
        )}
      </div>
    </div>
  )
}
