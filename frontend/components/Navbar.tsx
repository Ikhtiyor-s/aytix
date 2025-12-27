'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from './Logo'
import LanguageSelector from './LanguageSelector'
import NotificationsDropdown from './NotificationsDropdown'
import FavoritesDropdown from './FavoritesDropdown'
import ProfileDropdown from './ProfileDropdown'

export default function Navbar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-50">
      <div className="w-full px-2 sm:px-4">
        <div className="flex items-center py-2 gap-2 sm:gap-4 lg:gap-6">
          {/* Logo - chap tomonda */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Bo'sh joy - mobilda ham o'ng tomonga surish uchun */}
          <div className="flex-1 lg:hidden" />

          {/* Qidiruv - markazda (faqat desktop) */}
          <div className="hidden lg:flex flex-1 justify-center min-w-0">
            <form onSubmit={handleSearch} className="relative flex w-full max-w-xl">
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 bg-slate-100 border-2 border-transparent rounded-full text-slate-800 text-base outline-none focus:bg-white focus:border-indigo-500 transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-full transition-all duration-300"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </form>
          </div>

          {/* O'ng tomon elementlari */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
            <a href="/admin-login" className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all hidden lg:flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin
            </a>

            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <NotificationsDropdown />

            <FavoritesDropdown />

            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}
