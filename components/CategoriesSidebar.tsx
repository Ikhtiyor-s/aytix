'use client'

import { useState, useEffect } from 'react'
import { categoryProjectsService, CategoryProject, SubcategoryProject } from '@/services/adminApi'
import { useLanguage } from '@/contexts/LanguageContext'

interface CategoryWithSubs extends CategoryProject {
  subcategories: SubcategoryProject[]
}

interface CategoriesSidebarProps {
  selectedCategory?: string
  selectedSubcategory?: string
  onCategorySelect: (categoryName: string | undefined) => void
  onSubcategorySelect: (categoryName: string, subcategory: string) => void
}

// SVG Icons for categories
const CategoryIcons: { [key: string]: JSX.Element } = {
  'Biznes va Avtomatlashtirish': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  'Savdo va Marketing': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'Moliyaviy Texnologiyalar': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  "Ta'lim va O'rganish": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'AI va Avtomatik Yordamchilar': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'Mobil va Veb Ilovalar': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  'Support': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  'Logistika va Yetkazib Berish': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  'default': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
}

export default function CategoriesSidebar({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
}: CategoriesSidebarProps) {
  const { t, getLocalizedName } = useLanguage()
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const cats = await categoryProjectsService.getCategories(true)
      const catsWithSubs = await Promise.all(
        cats.map(async (cat) => {
          try {
            const subs = await categoryProjectsService.getSubcategories(cat.id, true)
            return { ...cat, subcategories: subs }
          } catch {
            return { ...cat, subcategories: [] }
          }
        })
      )
      setCategories(catsWithSubs)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (cat: CategoryWithSubs) => {
    if (expandedCategory === cat.id) {
      setExpandedCategory(null)
      onCategorySelect(undefined)
    } else {
      setExpandedCategory(cat.id)
      onCategorySelect(cat.name_uz)
      onSubcategorySelect(cat.name_uz, '')
    }
  }

  const handleSubcategoryClick = (categoryName: string, subcategory: string) => {
    onSubcategorySelect(categoryName, subcategory)
  }

  const getCategoryIcon = (cat: CategoryWithSubs) => {
    return CategoryIcons[cat.name_uz] || CategoryIcons['default']
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          {t('common.loading')}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
      <div className="py-2">
        {categories.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-4">
            {t('common.error')}
          </div>
        ) : (
          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name_uz
              const isExpanded = expandedCategory === cat.id

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all relative ${
                      isSelected
                        ? 'text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {/* Left border indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r" />
                    )}

                    {/* Icon */}
                    <span className={isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}>
                      {getCategoryIcon(cat)}
                    </span>

                    {/* Name */}
                    <span className={`flex-1 text-sm ${isSelected ? 'font-medium' : ''}`}>
                      {getLocalizedName(cat)}
                    </span>

                    {/* Expand arrow */}
                    {cat.subcategories.length > 0 && (
                      <svg
                        className={`w-4 h-4 transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Subcategories */}
                  {isExpanded && cat.subcategories.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-700/30">
                      <button
                        onClick={() => {
                          onCategorySelect(cat.name_uz)
                          onSubcategorySelect(cat.name_uz, '')
                        }}
                        className={`w-full text-left pl-12 pr-4 py-2.5 text-sm transition-all ${
                          isSelected && !selectedSubcategory
                            ? 'text-teal-600 dark:text-teal-400 font-medium'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {t('categories.showAll')}
                      </button>
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategoryClick(cat.name_uz, sub.name_uz)}
                          className={`w-full text-left pl-12 pr-4 py-2.5 text-sm transition-all ${
                            isSelected && selectedSubcategory === sub.name_uz
                              ? 'text-teal-600 dark:text-teal-400 font-medium'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {getLocalizedName(sub)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Clear filter button */}
        <div className="px-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => {
              setExpandedCategory(null)
              onCategorySelect(undefined)
            }}
            className="w-full px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('common.clearFilter')}
          </button>
        </div>
      </div>
    </div>
  )
}
