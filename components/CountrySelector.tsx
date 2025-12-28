'use client'

import { useState } from 'react'
import { countries, Country, defaultCountry } from '@/lib/countries'

interface CountrySelectorProps {
  selectedCountry: Country
  onCountryChange: (country: Country) => void
}

export default function CountrySelector({ selectedCountry, onCountryChange }: CountrySelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 border-2 border-r-0 border-slate-200 rounded-l-xl hover:bg-slate-200 transition-all"
      >
        <span className="text-base">{selectedCountry.flag}</span>
        <span className="text-slate-600 font-medium text-sm">{selectedCountry.dialCode}</span>
        <svg
          className={`w-4 h-4 text-slate-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-64 overflow-y-auto">
          <div className="p-1.5">
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onCountryChange(country)
                  setShowDropdown(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all flex items-center gap-2 ${
                  selectedCountry.code === country.code ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
                }`}
              >
                <span className="text-base">{country.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{country.name}</div>
                  <div className="text-xs text-slate-500">{country.dialCode}</div>
                </div>
                {selectedCountry.code === country.code && (
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

