'use client'

import { useState, useEffect, useRef, useCallback, RefObject } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { CategoryIcons } from './categoryIcons'
import { useCategoryData, CategoryWithSubs } from '@/hooks/useCategoryData'

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
  const {
    categories, loading, expandedCategory, setExpandedCategory,
    getCategoryCount, getSubcategoryCount,
  } = useCategoryData(selectedCategory)
  const [maxHeight, setMaxHeight] = useState<string>('calc(100vh - 110px)')
  const panelRef = useRef<HTMLDivElement>(null)

  // Tashqariga bosganda yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerButtonRef?.current && triggerButtonRef.current.contains(target)) return
      if (panelRef.current && !panelRef.current.contains(target)) onClose()
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose, triggerButtonRef])

  const calculateMaxHeight = useCallback(() => {
    const footer = document.querySelector('footer')
    const headerHeight = 100
    if (footer) {
      const footerRect = footer.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      if (footerRect.top < viewportHeight) {
        const availableHeight = footerRect.top - headerHeight - 10
        setMaxHeight(availableHeight > 100 ? `${availableHeight}px` : '100px')
      } else {
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

  const handleClearFilter = () => {
    setExpandedCategory(null)
    onCategorySelect(undefined)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="lg:hidden fixed left-0 top-[100px] z-30">
      <div ref={panelRef} className="w-[50vw] min-w-[200px] max-w-[300px] bg-white dark:bg-slate-800 flex flex-col shadow-xl border-r border-slate-200 animate-slide-left overflow-hidden transition-all duration-150" style={{ maxHeight }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="line-clamp-1">{t('categories.all')}</span>
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors flex-shrink-0">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center text-slate-500 py-6 text-xs">{t('common.loading')}</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-slate-500 py-6 text-xs">{t('marketplace.noProjects')}</div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full text-left px-2 py-2 rounded-lg hover:bg-indigo-50 transition-all flex items-start justify-between gap-1 ${
                      selectedCategory === cat.name_uz ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-700 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      <span className="flex-shrink-0 mt-0.5 text-slate-500">{getCategoryIcon(cat)}</span>
                      <span className="text-xs line-clamp-2 leading-tight">
                        {getLocalizedName(cat)}
                        {getCategoryCount(cat.name_uz) > 0 && (
                          <span className="ml-1 text-[10px] text-slate-400">({getCategoryCount(cat.name_uz)})</span>
                        )}
                      </span>
                    </div>
                    {cat.subcategories.length > 0 && (
                      <svg className={`w-3 h-3 transition-transform flex-shrink-0 mt-0.5 ${expandedCategory === cat.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {expandedCategory === cat.id && cat.subcategories.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      <button
                        onClick={() => { onCategorySelect(cat.name_uz); onSubcategorySelect(cat.name_uz, ''); onClose() }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-all text-[10px] ${
                          selectedCategory === cat.name_uz && !selectedSubcategory ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600'
                        }`}
                      >
                        {t("common.seeAll")}
                      </button>
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => { onSubcategorySelect(cat.name_uz, sub.name_uz); onClose() }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-all text-[10px] line-clamp-2 leading-tight ${
                            selectedCategory === cat.name_uz && selectedSubcategory === sub.name_uz ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600'
                          }`}
                        >
                          {getLocalizedName(sub)}
                          {getSubcategoryCount(cat.name_uz, sub.name_uz) > 0 && (
                            <span className="ml-1 text-slate-400">({getSubcategoryCount(cat.name_uz, sub.name_uz)})</span>
                          )}
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
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
