'use client'

import { useState, useEffect, useRef, useCallback, RefObject } from 'react'
import { categoryProjectsService, CategoryProject, SubcategoryProject, projectsService, ProjectCounts } from '@/services/adminApi'
import { useLanguage } from '@/contexts/LanguageContext'

// SVG Icons for categories (same as desktop)
const CategoryIcons: { [key: string]: JSX.Element } = {
  'Biznes va Avtomatlashtirish': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  'Savdo va Marketing': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'Moliyaviy Texnologiyalar': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  "Ta'lim va O'rganish": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'AI va Avtomatik Yordamchilar': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'Mobil va Veb Ilovalar': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  'Support': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  'Logistika va Yetkazib Berish': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  'default': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
}

interface CategoryWithSubs extends CategoryProject {
  subcategories: SubcategoryProject[]
}

interface MobileCategoryFilterProps {
  isOpen: boolean
  onClose: () => void
  selectedCategory?: string
  selectedSubcategory?: string
  onCategorySelect: (categoryName: string | undefined) => void
  onSubcategorySelect: (categoryName: string, subcategory: string) => void
  triggerButtonRef?: RefObject<HTMLButtonElement | null>
}

export default function MobileCategoryFilter({
  isOpen,
  onClose,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  triggerButtonRef,
}: MobileCategoryFilterProps) {
  const { t, getLocalizedName } = useLanguage()
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [maxHeight, setMaxHeight] = useState<string>('calc(100vh - 110px)')
  const [projectCounts, setProjectCounts] = useState<ProjectCounts>({ categories: {}, subcategories: {} })
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadProjectCounts()
    }
  }, [isOpen])

// Tashqariga bosganda yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // Trigger tugmasiga bosilgan bo'lsa, yopmaslik (toggle ishlaydi)
      if (triggerButtonRef?.current && triggerButtonRef.current.contains(target)) {
        return
      }
      // Panel tashqarisiga bosilgan bo'lsa yopish
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, triggerButtonRef])

  // Footer pozitsiyasiga qarab panel balandligini dinamik hisoblash
  const calculateMaxHeight = useCallback(() => {
    const footer = document.querySelector('footer')
    const headerHeight = 100 // top-[100px] - header va mobile menu balandligi

    if (footer) {
      const footerRect = footer.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      // Footer ekranga kirganda
      if (footerRect.top < viewportHeight) {
        const availableHeight = footerRect.top - headerHeight - 10 // 10px bo'shliq
        if (availableHeight > 100) {
          setMaxHeight(`${availableHeight}px`)
        } else {
          setMaxHeight('100px')
        }
      } else {
        // Footer ekranda yo'q bo'lsa
        setMaxHeight(`calc(100vh - ${headerHeight + 10}px)`)
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      calculateMaxHeight()
      window.addEventListener('scroll', calculateMaxHeight)
      window.addEventListener('resize', calculateMaxHeight)
    }

    return () => {
      window.removeEventListener('scroll', calculateMaxHeight)
      window.removeEventListener('resize', calculateMaxHeight)
    }
  }, [isOpen, calculateMaxHeight])

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

  const loadProjectCounts = async () => {
    try {
      const counts = await projectsService.getCounts()
      setProjectCounts(counts)
    } catch (error) {
      console.error('Failed to load project counts:', error)
    }
  }

  const getCategoryCount = (categoryName: string): number => {
    return projectCounts.categories[categoryName] || 0
  }

  const getSubcategoryCount = (categoryName: string, subcategoryName: string): number => {
    const key = categoryName + ':' + subcategoryName
    return projectCounts.subcategories[key] || 0
  }

  const getCategoryIcon = (cat: CategoryWithSubs) => {
    return CategoryIcons[cat.name_uz] || CategoryIcons['default']
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
    onClose()
  }

  const handleClearFilter = () => {
    setExpandedCategory(null)
    onCategorySelect(undefined)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="lg:hidden fixed left-0 top-[100px] z-30">
      {/* Left Side Panel - fixed position, header + mobile menu ostida */}
      <div ref={panelRef} className="w-[50vw] min-w-[200px] max-w-[300px] bg-white dark:bg-slate-800 flex flex-col shadow-xl border-r border-slate-200 animate-slide-left overflow-hidden transition-all duration-150" style={{ maxHeight }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="line-clamp-1">{t('categories.all')}</span>
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center text-slate-500 py-6 text-xs">
              {t('common.loading')}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-slate-500 py-6 text-xs">
              {t('marketplace.noProjects')}
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full text-left px-2 py-2 rounded-lg hover:bg-indigo-50 transition-all flex items-start justify-between gap-1 ${
                      selectedCategory === cat.name_uz
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-slate-700 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      <span className="flex-shrink-0 mt-0.5 text-slate-500">{getCategoryIcon(cat)}</span>
                      <span className="text-xs line-clamp-2 leading-tight">
                        {getLocalizedName(cat)}
                        {getCategoryCount(cat.name_uz) > 0 && (
                          <span className="ml-1 text-[10px] text-slate-400">
                            ({getCategoryCount(cat.name_uz)})
                          </span>
                        )}
                      </span>
                    </div>
                    {cat.subcategories.length > 0 && (
                      <svg
                        className={`w-3 h-3 transition-transform flex-shrink-0 mt-0.5 ${
                          expandedCategory === cat.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Subcategories */}
                  {expandedCategory === cat.id && cat.subcategories.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      <button
                        onClick={() => {
                          onCategorySelect(cat.name_uz)
                          onSubcategorySelect(cat.name_uz, '')
                          onClose()
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-all text-[10px] ${
                          selectedCategory === cat.name_uz && !selectedSubcategory
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-slate-600'
                        }`}
                      >
                        {t("common.seeAll")}
                      </button>
                      {cat.subcategories.map((sub) => {
                        const subCount = getSubcategoryCount(cat.name_uz, sub.name_uz)
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(cat.name_uz, sub.name_uz)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-all text-[10px] line-clamp-2 leading-tight ${
                              selectedCategory === cat.name_uz && selectedSubcategory === sub.name_uz
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-slate-600'
                            }`}
                          >
                            {getLocalizedName(sub)}
                            {subCount > 0 && (
                              <span className="ml-1 text-slate-400">({subCount})</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleClearFilter}
            className="w-full px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-medium transition-all flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="line-clamp-1">{t('common.clearFilter')}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
