// Til sozlamalari

export interface Language {
  code: string
  name: string
  flag: string
  nativeName: string
}

export const languages: Language[] = [
  { code: 'uz', name: "O'zbek", flag: '🇺🇿', nativeName: 'O\'zbek' },
  { code: 'ru', name: 'Rus', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'en', name: 'Ingliz', flag: '🇬🇧', nativeName: 'English' },
]

export const defaultLanguage: Language = languages[0] // O'zbek

