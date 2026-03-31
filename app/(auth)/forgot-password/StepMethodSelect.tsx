'use client'

import Link from 'next/link'
import CountrySelector from '@/components/CountrySelector'
import { Country } from '@/lib/countries'

type AuthMethod = 'telegram' | 'email'

export interface StepMethodSelectProps {
  authMethod: AuthMethod
  setAuthMethod: (method: AuthMethod) => void
  selectedCountry: Country
  setSelectedCountry: (country: Country) => void
  phone: string
  formatPhoneNumber: (value: string) => string
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  email: string
  setEmail: (email: string) => void
  telegramConnected: boolean | null
  setTelegramConnected: (value: boolean | null) => void
  checkingTelegram: boolean
  checkTelegramStatus: () => void
  error: string
  loading: boolean
  handleSendOTP: () => void
}

export default function StepMethodSelect({
  authMethod,
  setAuthMethod,
  selectedCountry,
  setSelectedCountry,
  phone,
  formatPhoneNumber,
  handlePhoneChange,
  email,
  setEmail,
  telegramConnected,
  setTelegramConnected,
  checkingTelegram,
  checkTelegramStatus,
  error,
  loading,
  handleSendOTP,
}: StepMethodSelectProps) {
  return (
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
                    <li>Telegramda <span className="font-semibold">@aytixuz_bot</span> ga o&apos;ting</li>
                    <li><span className="font-semibold">/start</span> bosing</li>
                    <li>&quot;Raqamni yuborish&quot; tugmasini bosing</li>
                    <li>Shu yerga qaytib, qayta urinib ko&apos;ring</li>
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
                    @aytixuz_bot ga o&apos;tish
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
  )
}
