'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Project, getImageUrl } from '@/services/adminApi'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { t, language } = useLanguage()
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

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

  // Kategoriya tarjima kalitlarini olish
  const categoryKeyMap: Record<string, string> = {
    'Biznes va Avtomatlashtirish': 'category.business',
    'Savdo va Marketing': 'category.sales',
    'AI va Avtomatik Yordamchilar': 'category.ai',
    'Mobil va Veb Ilovalar': 'category.mobile',
    "Ta'lim va O'rganish": 'category.education',
    'Moliyaviy Texnologiyalar': 'category.finance',
    'Support': 'category.support',
    'Logistika va Yetkazib Berish': 'category.logistics',
    'Sanoat va Ishlab Chiqarish': 'category.industry',
  }

  const getCategoryName = (categoryUz: string): string => {
    const key = categoryKeyMap[categoryUz]
    return key ? t(key) : categoryUz
  }

  // HTML teglarini va entitylarni olib tashlash
  const stripHtml = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-zA-Z0-9#]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const projectName = getLocalizedField(project.name_uz, project.name_ru, project.name_en)
  const projectDescription = stripHtml(getLocalizedField(
    project.description_uz || '',
    project.description_ru,
    project.description_en
  ))

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

  // Barcha rasmlarni yig'ish (image_url + images array)
  const allImages = useMemo(() => {
    const imgs: string[] = []
    if (project.image_url) {
      const url = getImageUrl(project.image_url)
      if (url) imgs.push(url)
    }
    if (project.images && Array.isArray(project.images)) {
      project.images.forEach(img => {
        const url = getImageUrl(img)
        if (url) imgs.push(url)
      })
    }
    return imgs
  }, [project.image_url, project.images])

  // Rasmlar avtomatik aylanishi (har 3 sekundda)
  useEffect(() => {
    if (allImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImgIndex(prev => (prev + 1) % allImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [allImages.length])

  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-slate-900/50 transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      {/* Rasm qismi - fixed height */}
      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
        {allImages.length > 0 ? (
          <div className="relative w-full h-full">
            {allImages.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`${projectName} - ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  idx === currentImgIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            {/* Rasm indikatorlari */}
            {allImages.length > 1 && (
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`block w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImgIndex ? 'bg-white w-3' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
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
          <span className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 ${badge.color} text-[10px] sm:text-xs font-bold rounded-full z-10`}>
            {badge.text}
          </span>
        )}
      </div>

      {/* Kontent qismi - flex grow */}
      <div className="flex flex-col flex-grow p-2.5 sm:p-3 lg:p-4">
        {/* Loyiha nomi - 1 qator */}
        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">
          {projectName}
        </h3>

        {/* Izoh - 2 qator */}
        <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2 min-h-[2.5em] whitespace-pre-line">
          {projectDescription || '\u00A0'}
        </p>

        {/* Technologies - fixed height */}
        <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
          {project.technologies && project.technologies.length > 0 ? (
            <>
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
            </>
          ) : null}
        </div>

      </div>
    </Link>
  )
}
