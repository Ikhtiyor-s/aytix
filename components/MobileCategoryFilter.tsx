'use client'

import { useState, useEffect, useRef, useCallback, RefObject } from 'react'
import { categoryProjectsService, CategoryProject, SubcategoryProject } from '@/services/adminApi'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
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

  const getCategoryIcon = (cat: CategoryWithSubs) => {
    if (!cat.icon || /^\d/.test(cat.icon)) {
      const iconMap: { [key: string]: string } = {
        'Biznes va Avtomatlashtirish': '💼',
        'Savdo va Marketing': '🛒',
        'Moliyaviy Texnologiyalar': '💰',
        "Ta'lim va O'rganish": '📚',
        'AI va Avtomatik Yordamchilar': '🤖',
        'Mobil va Veb Ilovalar': '📱',
        'Support': '📋',
        'Logistika va Yetkazib Berish': '🚚',
      }
      return iconMap[cat.name_uz] || '📁'
    }
    return cat.icon
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
        <div className="flex items-center justify-between p-3 border-b border-slate-100">
          <h2 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
            <span className="text-sm">📂</span>
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
                      <span className="text-sm flex-shrink-0 mt-0.5">{getCategoryIcon(cat)}</span>
                      <span className="text-xs line-clamp-2 leading-tight">{getLocalizedName(cat)}</span>
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
                      {cat.subcategories.map((sub) => (
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
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-100">
          <button
            onClick={handleClearFilter}
            className="w-full px-2 py-2 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-[10px] font-medium transition-all flex items-center justify-center gap-1"
          >
            <span className="text-sm">🔄</span>
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
