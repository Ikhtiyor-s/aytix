'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from './Logo'
import LanguageSelector from './LanguageSelector'
import ContactModal from './ContactModal'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { projectsService, Project } from '@/services/adminApi'

export default function Navbar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showContactModal, setShowContactModal] = useState(false)
  const [suggestions, setSuggestions] = useState<Project[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()
  const { t, language } = useLanguage()

  // 3 ta harfdan keyin qidiruv
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const results = await projectsService.getProjects({
          search: searchQuery.trim(),
          limit: 5,
          status: 'active'
        })
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getLocalizedName = useCallback((project: Project) => {
    if (language.code === 'ru' && project.name_ru) return project.name_ru
    if (language.code === 'en' && project.name_en) return project.name_en
    return project.name_uz
  }, [language.code])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`)
  }

  const handleSuggestionClick = (projectId: number) => {
    setShowSuggestions(false)
    setSearchQuery('')
    router.push(`/projects/${projectId}`)
  }

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-700 fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
      <div className="w-full px-2 sm:px-4">
        <div className="flex items-center py-2 gap-2 sm:gap-4 lg:gap-6">
          {/* Logo - chap tomonda */}
          <div className="flex-shrink-0 pl-2 sm:pl-4 lg:pl-8">
            <Logo />
          </div>

          {/* Bo'sh joy - mobilda ham o'ng tomonga surish uchun */}
          <div className="flex-1 lg:hidden" />

          {/* Qidiruv - markazda (faqat desktop) */}
          <div className="hidden lg:flex flex-1 justify-center min-w-0" ref={searchRef}>
            <div className="relative w-full max-w-xl">
              <form onSubmit={handleSearch} className="relative flex">
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full h-10 pl-4 pr-12 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-full text-slate-800 dark:text-slate-200 text-base outline-none focus:bg-white dark:focus:bg-slate-600 focus:border-indigo-500 transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-400"
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

              {/* Autocomplete suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  {suggestions.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSuggestionClick(project.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                        {getLocalizedName(project)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* O'ng tomon elementlari */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
            <button
              onClick={() => setShowContactModal(true)}
              className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all hidden lg:flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {t('marketplace.contactAdmin')}
            </button>

            <LanguageSelector />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </header>
  )
}
