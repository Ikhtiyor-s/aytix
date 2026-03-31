'use client'

export interface StepNewPasswordProps {
  newPassword: string
  setNewPassword: (value: string) => void
  newPasswordConfirm: string
  setNewPasswordConfirm: (value: string) => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (value: boolean) => void
  error: string
  success: string
  loading: boolean
  handleResetPassword: () => void
}

export default function StepNewPassword({
  newPassword,
  setNewPassword,
  newPasswordConfirm,
  setNewPasswordConfirm,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  error,
  success,
  loading,
  handleResetPassword,
}: StepNewPasswordProps) {
  return (
    <div>
      {/* Parol talablari */}
      <div className="mb-3 p-2.5 bg-slate-50 rounded-lg">
        <p className="text-xs font-medium text-slate-700 mb-1.5">Parol talablari:</p>
        <ul className="text-xs text-slate-500 space-y-0.5">
          <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
            {newPassword.length >= 8 ? '\u2713' : '\u2022'} Kamida 8 ta belgi
          </li>
          <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
            {/[A-Z]/.test(newPassword) ? '\u2713' : '\u2022'} Kamida bitta katta harf
          </li>
          <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
            {/[a-z]/.test(newPassword) ? '\u2713' : '\u2022'} Kamida bitta kichik harf
          </li>
          <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>
            {/\d/.test(newPassword) ? '\u2713' : '\u2022'} Kamida bitta raqam
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
  )
}
