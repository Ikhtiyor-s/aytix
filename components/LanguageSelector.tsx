'use client'

import { useState, useEffect, useRef } from 'react'
import { languages } from '@/lib/languages'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLanguageChange = (lang: typeof language) => {
    setLanguage(lang)
    setShowDropdown(false)
  }

  // Tashqariga bosganda yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 px-3 h-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-all border-2 border-transparent hover:border-indigo-500/30"
      >
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{language.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 dropdown-slide-down overflow-hidden">
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-center px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-2 ${
                  language.code === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="font-semibold">{lang.code.toUpperCase()}</span>
                {language.code === lang.code && (
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
