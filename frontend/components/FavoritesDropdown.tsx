'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { formatPrice } from '@/utils/formatters'

export default function FavoritesDropdown() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [favorites, setFavorites] = useState<Product[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Failed to load favorites', e)
      }
    }
  }, [])

  const removeFavorite = (id: number) => {
    const newFavorites = favorites.filter(f => f.id !== id)
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-3 hover:bg-slate-100 rounded-full transition-all"
      >
        <svg className="w-5 h-5 text-red-500 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {favorites.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="fixed top-20 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 dropdown-slide-down max-h-[600px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Sevimlilar</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {favorites.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="mb-4">Sevimlilar bo'sh</p>
                <Link
                  href="/marketplace"
                  onClick={() => setShowDropdown(false)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Mahsulotlarni ko'rish
                </Link>
              </div>
            ) : (
              favorites.map((product) => (
                <div
                  key={product.id}
                  className="p-4 hover:bg-slate-50 border-b border-slate-100"
                >
                  <div className="flex gap-3">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${product.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="block"
                      >
                        <h4 className="font-semibold text-slate-900 mb-1 line-clamp-1">{product.name}</h4>
                        <p className="text-sm text-indigo-600 font-bold">{formatPrice(product.price)}</p>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFavorite(product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {favorites.length > 0 && (
            <div className="p-3 border-t border-slate-100">
              <Link
                href="/favorites"
                onClick={() => setShowDropdown(false)}
                className="block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
              >
                Barcha sevimlilarni ko'rish
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

