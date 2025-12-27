'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Project, getImageUrl } from '@/services/adminApi'

export default function FavoritesDropdown() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [favorites, setFavorites] = useState<Project[]>([])
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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
  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favoriteProjects')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Failed to load favorites', e)
      }
    } else {
      setFavorites([])
    }
  }

  useEffect(() => {
    if (!mounted) return
    loadFavorites()

    // Custom event listener - loyiha sevimliarga qo'shilganda/olib tashlaganda
    const handleFavoritesUpdated = () => {
      loadFavorites()
    }

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated)
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated)
    }
  }, [mounted])

  const removeFavorite = (id: number) => {
    const newFavorites = favorites.filter(f => f.id !== id)
    setFavorites(newFavorites)
    localStorage.setItem('favoriteProjects', JSON.stringify(newFavorites))
    // Dispatch event to update ProjectCard states
    window.dispatchEvent(new CustomEvent('favoritesUpdated'))
  }

  if (!mounted) {
    return (
      <div className="relative">
        <button className="relative p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-all">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-all"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        {favorites.length > 0 && (
          <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-red-500 text-white text-[8px] sm:text-[9px] rounded-full flex items-center justify-center font-bold">
            {favorites.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="fixed right-0 top-14 w-[40%] max-w-[400px] bg-white rounded-l-xl shadow-2xl border border-slate-100 z-50 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base text-slate-800">Sevimli loyihalar</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {favorites.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-500">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <p className="mb-3 sm:mb-4 text-xs sm:text-sm">Sevimli loyihalar yo'q</p>
                <Link
                  href="/marketplace"
                  onClick={() => setShowDropdown(false)}
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Loyihalarni ko'rish
                </Link>
              </div>
            ) : (
              favorites.map((project) => (
                <div
                  key={project.id}
                  className="p-3 sm:p-4 hover:bg-slate-50 border-b border-slate-100"
                >
                  <div className="flex gap-2 sm:gap-3">
                    {project.image_url ? (
                      <img
                        src={getImageUrl(project.image_url) || ''}
                        alt={project.name_uz}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex-shrink-0 bg-gradient-to-br ${project.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center`}>
                        <span className="text-lg sm:text-xl">🚀</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="block"
                      >
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mb-0.5 sm:mb-1 line-clamp-1">{project.name_uz}</h4>
                        <p className="text-[10px] sm:text-xs text-indigo-600 font-medium line-clamp-1">{project.category}</p>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFavorite(project.id)}
                      className="text-red-500 hover:text-red-700 p-0.5 sm:p-1 flex-shrink-0"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
