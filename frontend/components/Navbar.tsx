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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4 gap-6">
          <Logo />

          <div className="flex-1 max-w-[380px]">
            <form onSubmit={handleSearch} className="relative flex">
              <input
                type="text"
                placeholder="Loyiha yoki xizmat qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 bg-slate-100 border-2 border-transparent rounded-full text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all duration-300"
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

          <div className="flex items-center gap-3">
            <a href="https://t.me/Ikhtiyor_sb" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all hidden md:block">
              Adminga murojaat
            </a>

            <LanguageSelector />

            <NotificationsDropdown />

            <FavoritesDropdown />

            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}
