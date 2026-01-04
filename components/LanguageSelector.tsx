'use client'

import { useState } from 'react'
import { languages, Language } from '@/lib/languages'

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0])
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang)
    setShowDropdown(false)
    // Here you would implement language switching logic
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 h-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-all border-2 border-transparent hover:border-indigo-500/30"
      >
        <span className="text-xl sm:text-2xl">{currentLang.flag}</span>
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
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 dropdown-slide-down">
          <div className="p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center gap-3 ${
                  currentLang.code === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{lang.nativeName}</div>
                </div>
                {currentLang.code === lang.code && (
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

