'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { CategoryIcons } from './categoryIcons'
import { useCategoryData, CategoryWithSubs } from '@/hooks/useCategoryData'

interface CategoriesSidebarProps {
  selectedCategory?: string
  selectedSubcategory?: string
  onCategorySelect: (categoryName: string | undefined) => void
  onSubcategorySelect: (categoryName: string, subcategory: string) => void
}

export default function CategoriesSidebar({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
}: CategoriesSidebarProps) {
  const { t, getLocalizedName } = useLanguage()
  const {
    categories, loading, expandedCategory, setExpandedCategory,
    getCategoryCount, getSubcategoryCount,
  } = useCategoryData(selectedCategory)

  const handleCategoryClick = (cat: CategoryWithSubs) => {
    if (expandedCategory === cat.id) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(cat.id)
      onCategorySelect(cat.name_uz)
    }
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
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r" />
                    )}
                    <span className={isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}>
                      {getCategoryIcon(cat)}
                    </span>
                    <span className={`flex-1 text-sm ${isSelected ? 'font-medium' : ''}`}>
                      {getLocalizedName(cat)}
                      {getCategoryCount(cat.name_uz) > 0 && (
                        <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                          ({getCategoryCount(cat.name_uz)})
                        </span>
                      )}
                    </span>
                    {cat.subcategories.length > 0 && (
                      <svg
                        className={`w-4 h-4 transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {isExpanded && cat.subcategories.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-700/30">
                      <button
                        onClick={() => { onCategorySelect(cat.name_uz); onSubcategorySelect(cat.name_uz, '') }}
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
                          onClick={() => onSubcategorySelect(cat.name_uz, sub.name_uz)}
                          className={`w-full text-left pl-12 pr-4 py-2.5 text-sm transition-all ${
                            isSelected && selectedSubcategory === sub.name_uz
                              ? 'text-teal-600 dark:text-teal-400 font-medium'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {getLocalizedName(sub)}
                          {getSubcategoryCount(cat.name_uz, sub.name_uz) > 0 && (
                            <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                              ({getSubcategoryCount(cat.name_uz, sub.name_uz)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="px-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => { setExpandedCategory(null); onCategorySelect(undefined) }}
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
