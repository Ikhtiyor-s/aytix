'use client'

type AuthMethod = 'telegram' | 'email'

export interface StepOtpVerifyProps {
  authMethod: AuthMethod
  dialCode: string
  formattedPhone: string
  email: string
  otp: string[]
  handleOTPChange: (index: number, value: string) => void
  handleOTPKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  handleOTPPaste: (e: React.ClipboardEvent) => void
  otpTimeLeft: number
  formatTime: (seconds: number) => string
  otpAttempts: number
  isBlocked: boolean
  error: string
  success: string
  loading: boolean
  handleVerifyOTP: () => void
  handleResendOTP: () => void
  onBack: () => void
}

export default function StepOtpVerify({
  authMethod,
  dialCode,
  formattedPhone,
  email,
  otp,
  handleOTPChange,
  handleOTPKeyDown,
  handleOTPPaste,
  otpTimeLeft,
  formatTime,
  otpAttempts,
  isBlocked,
  error,
  success,
  loading,
  handleVerifyOTP,
  handleResendOTP,
  onBack,
}: StepOtpVerifyProps) {
  return (
    <div>
      <div className="text-center mb-4">
        <p className="text-xs text-slate-600">
          {authMethod === 'telegram'
            ? `Telegram orqali ${dialCode} ${formattedPhone} raqamiga kod yuborildi`
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
            Hisob bloklangan. 15 daqiqadan keyin qayta urinib ko&apos;ring.
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
        onClick={onBack}
        className="w-full text-center text-xs text-slate-500 hover:text-slate-700 mt-2"
      >
        Orqaga
      </button>
    </div>
  )
}
