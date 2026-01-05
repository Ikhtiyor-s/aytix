'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Project, getImageUrl } from '@/services/adminApi'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { t, language } = useLanguage()
  const [isFavorite, setIsFavorite] = useState(false)

  // Tilga qarab nom va tavsifni olish
  const getLocalizedField = (fieldUz: string, fieldRu?: string | null, fieldEn?: string | null) => {
    if (language.code === 'ru' && fieldRu) return fieldRu
    if (language.code === 'en' && fieldEn) return fieldEn
    return fieldUz
  }

  // Object yoki string tipidagi ma'lumotni tilga qarab olish
  const getLocalizedValue = (item: unknown): string => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as { uz?: string; ru?: string; en?: string }
      if (language.code === 'ru' && obj.ru) return obj.ru
      if (language.code === 'en' && obj.en) return obj.en
      return obj.uz || JSON.stringify(item)
    }
    return String(item)
  }

  const projectName = getLocalizedField(project.name_uz, project.name_ru, project.name_en)
  const projectDescription = getLocalizedField(
    project.description_uz || '',
    project.description_ru,
    project.description_en
  )

  // localStorage dan sevimlilarni tekshirish
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteProjects')
    if (savedFavorites) {
      try {
        const favorites: Project[] = JSON.parse(savedFavorites)
        setIsFavorite(favorites.some(f => f.id === project.id))
      } catch (e) {
        console.error('Failed to load favorites', e)
      }
    }
  }, [project.id])

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const savedFavorites = localStorage.getItem('favoriteProjects')
    let favorites: Project[] = []

    if (savedFavorites) {
      try {
        favorites = JSON.parse(savedFavorites)
      } catch (e) {
        console.error('Failed to parse favorites', e)
      }
    }

    if (isFavorite) {
      // Sevimlilardan olib tashlash
      favorites = favorites.filter(f => f.id !== project.id)
    } else {
      // Sevimlilarga qo'shish
      favorites.push(project)
    }

    localStorage.setItem('favoriteProjects', JSON.stringify(favorites))
    setIsFavorite(!isFavorite)

    // Custom event yuborish - FavoritesDropdown yangilanishi uchun
    window.dispatchEvent(new CustomEvent('favoritesUpdated'))
  }

  const getBadge = () => {
    if (project.is_top) return { text: 'TOP', color: 'bg-yellow-400 text-slate-900' }
    if (project.is_new) return { text: t('home.new'), color: 'bg-green-500 text-white' }
    return null
  }

  const badge = getBadge()

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-slate-900/50 transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {project.image_url ? (
          <img
            src={getImageUrl(project.image_url) || ''}
            alt={projectName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${project.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center`}>
            <span className="text-6xl text-white/80">
              {project.category === 'Biznes va Avtomatlashtirish' && '💼'}
              {project.category === 'Savdo va Marketing' && '📈'}
              {project.category === 'AI va Avtomatik Yordamchilar' && '🤖'}
              {project.category === 'Mobil va Veb Ilovalar' && '📱'}
              {project.category === "Ta'lim va O'rganish" && '📚'}
              {!['Biznes va Avtomatlashtirish', 'Savdo va Marketing', 'AI va Avtomatik Yordamchilar', 'Mobil va Veb Ilovalar', "Ta'lim va O'rganish"].includes(project.category) && '🚀'}
            </span>
          </div>
        )}
        {badge && (
          <span className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 ${badge.color} text-[10px] sm:text-xs font-bold rounded-full`}>
            {badge.text}
          </span>
        )}
        {/* TODO: Keyinchalik qo'shiladi */}
        {/* <button
          onClick={toggleFavorite}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <svg
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button> */}
      </div>
      <div className="p-2.5 sm:p-3 lg:p-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 mb-0.5 sm:mb-1 line-clamp-2">{projectName}</h3>
        {projectDescription && (
          <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 dark:text-slate-400 mb-1.5 sm:mb-2 line-clamp-2">{projectDescription}</p>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-2">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="px-1.5 sm:px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs rounded-full">
                {getLocalizedValue(tech)}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs rounded-full">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-xs lg:text-sm text-indigo-600 dark:text-indigo-400 font-medium line-clamp-1">{project.category}</span>
            <span className="flex items-center gap-0.5 sm:gap-1 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs lg:text-sm">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {project.views}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
