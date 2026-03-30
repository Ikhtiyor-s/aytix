'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Language, languages, defaultLanguage } from '@/lib/languages'
import { uz } from './translations.uz'
import { ru } from './translations.ru'
import { en } from './translations.en'

interface LocalizedItem {
  name_uz: string
  name_ru?: string | null
  name_en?: string | null
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  getLocalizedName: (item: LocalizedItem) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Tarjimalar
const translations: Record<string, Record<string, string>> = { uz, ru, en }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)

  useEffect(() => {
    const savedLangCode = localStorage.getItem('language')
    if (savedLangCode) {
      const savedLang = languages.find(l => l.code === savedLangCode)
      if (savedLang) {
        setLanguageState(savedLang)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang.code)
  }

  const t = (key: string): string => {
    return translations[language.code]?.[key] || translations['uz'][key] || key
  }

  const getLocalizedName = (item: LocalizedItem): string => {
    if (language.code === 'ru' && item.name_ru) return item.name_ru
    if (language.code === 'en' && item.name_en) return item.name_en
    return item.name_uz
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedName }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
