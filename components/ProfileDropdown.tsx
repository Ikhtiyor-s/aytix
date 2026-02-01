/**
 * ProfileDropdown - Foydalanuvchi profil menyusi.
 *
 * O'ng yuqori burchakda profil rasmi/logosi ko'rsatiladi.
 * Bosilganda dropdown ochiladi: Sozlamalar va Chiqish tugmalari.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ProfileDropdown() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Chiqish dialogini ochish
  const openLogoutModal = () => {
    setShowLogoutModal(true)
    setIsOpen(false)
  }

  // Chiqishni tasdiqlash
  const confirmLogout = () => {
    logout()
    setShowLogoutModal(false)
    router.push('/login')
  }

  // Chiqishni bekor qilish
  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  // Server-side yoki loading - placeholder ko'rsatish
  if (!mounted || loading) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 h-8 sm:h-10 rounded-full bg-slate-100">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center overflow-hidden bg-white">
          <img
            src="/aytixlogo.png"
            alt="AyTix"
            className="w-full h-full object-contain p-0.5"
          />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs sm:text-sm font-semibold text-slate-400">...</div>
        </div>
      </div>
    )
  }

  // Agar autentifikatsiya bo'lmasa, login link ko'rsatish
  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 h-8 sm:h-10 rounded-full bg-slate-100 cursor-pointer hover:bg-slate-200 transition-all"
      >
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center overflow-hidden">
          <img
            src="/aytixlogo.png"
            alt="Login"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs sm:text-sm font-semibold text-slate-900">Kirish</div>
        </div>
      </Link>
    )
  }

  // Profil rasmi yoki AyTix logosi
  const profileImage = user?.profile_image || null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profil tugmasi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 h-8 sm:h-10 rounded-full bg-slate-100 cursor-pointer hover:bg-slate-200 transition-all"
      >
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center overflow-hidden bg-white">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profil"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/aytixlogo.png"
              alt="AyTix"
              className="w-full h-full object-contain p-0.5"
            />
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs sm:text-sm font-semibold text-slate-900">
            {user?.first_name || user?.full_name?.split(' ')[0] || user?.username || t('profile.user')}
          </div>
        </div>
        {/* Chevron icon */}
        <svg
          className={`w-3 h-3 sm:w-4 sm:h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menyu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 sm:w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
          {/* Foydalanuvchi ma'lumotlari */}
          <div className="p-2.5 sm:p-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/aytixlogo.png"
                    alt="AyTix"
                    className="w-full h-full object-contain p-0.5"
                  />
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                  {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || t('profile.user')}
                </div>
              </div>
            </div>
          </div>

          {/* Menyu elementlari */}
          <div className="p-1.5">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{t('settings.title')}</span>
            </Link>

            <button
              onClick={openLogoutModal}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{t('profile.logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Chiqish tasdiqlash modali */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelLogout}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl p-4 sm:p-5 w-full max-w-xs mx-3 animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 text-center mb-1.5">
              {t('profile.signOut')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-4">
              {t('profile.confirmLogout')}
            </p>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={cancelLogout}
                className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
