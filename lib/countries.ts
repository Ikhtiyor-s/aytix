// Mamlakatlar ro'yxati

export interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
  phoneLength: number
  placeholder: string
}

export const countries: Country[] = [
  { code: 'UZ', name: "O'zbekiston", flag: '🇺🇿', dialCode: '+998', phoneLength: 9, placeholder: '90 123 45 67' },
  { code: 'RU', name: 'Rossiya', flag: '🇷🇺', dialCode: '+7', phoneLength: 10, placeholder: '912 345 67 89' },
  { code: 'US', name: "Qo'shma Shtatlar", flag: '🇺🇸', dialCode: '+1', phoneLength: 10, placeholder: '202 555 0123' },
  { code: 'KZ', name: 'Qozog\'iston', flag: '🇰🇿', dialCode: '+7', phoneLength: 10, placeholder: '701 234 56 78' },
  { code: 'TJ', name: 'Tojikiston', flag: '🇹🇯', dialCode: '+992', phoneLength: 9, placeholder: '92 123 45 67' },
  { code: 'KG', name: 'Qirg\'iziston', flag: '🇰🇬', dialCode: '+996', phoneLength: 9, placeholder: '555 123 456' },
  { code: 'TM', name: 'Turkmaniston', flag: '🇹🇲', dialCode: '+993', phoneLength: 8, placeholder: '65 12 34 56' },
  { code: 'AF', name: 'Afg\'oniston', flag: '🇦🇫', dialCode: '+93', phoneLength: 9, placeholder: '70 123 4567' },
  { code: 'TR', name: 'Turkiya', flag: '🇹🇷', dialCode: '+90', phoneLength: 10, placeholder: '532 123 45 67' },
  { code: 'CN', name: 'Xitoy', flag: '🇨🇳', dialCode: '+86', phoneLength: 11, placeholder: '138 0013 8000' },
  { code: 'IN', name: 'Hindiston', flag: '🇮🇳', dialCode: '+91', phoneLength: 10, placeholder: '98765 43210' },
  { code: 'PK', name: 'Pokiston', flag: '🇵🇰', dialCode: '+92', phoneLength: 10, placeholder: '300 1234567' },
  { code: 'IR', name: 'Eron', flag: '🇮🇷', dialCode: '+98', phoneLength: 10, placeholder: '912 345 6789' },
  { code: 'DE', name: 'Germaniya', flag: '🇩🇪', dialCode: '+49', phoneLength: 11, placeholder: '151 23456789' },
  { code: 'GB', name: 'Buyuk Britaniya', flag: '🇬🇧', dialCode: '+44', phoneLength: 10, placeholder: '7911 123456' },
  { code: 'FR', name: 'Fransiya', flag: '🇫🇷', dialCode: '+33', phoneLength: 9, placeholder: '6 12 34 56 78' },
  { code: 'IT', name: 'Italiya', flag: '🇮🇹', dialCode: '+39', phoneLength: 10, placeholder: '312 345 6789' },
  { code: 'ES', name: 'Ispaniya', flag: '🇪🇸', dialCode: '+34', phoneLength: 9, placeholder: '612 34 56 78' },
  { code: 'AE', name: 'Birlashgan Arab Amirliklari', flag: '🇦🇪', dialCode: '+971', phoneLength: 9, placeholder: '50 123 4567' },
  { code: 'SA', name: 'Saudiya Arabistoni', flag: '🇸🇦', dialCode: '+966', phoneLength: 9, placeholder: '50 123 4567' },
]

export const defaultCountry: Country = countries[0] // O'zbekiston

