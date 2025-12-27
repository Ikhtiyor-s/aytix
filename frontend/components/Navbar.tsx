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
            <a href="https://t.me/Ikhtiyor_sb" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all hidden lg:flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Adminga murojaat
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
