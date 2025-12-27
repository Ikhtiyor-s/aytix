'use client'

import { useState, useEffect } from 'react'
import { categoryProjectsService, CategoryProject, SubcategoryProject } from '@/services/adminApi'

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
}

export default function MobileCategoryFilter({
  isOpen,
  onClose,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
}: MobileCategoryFilterProps) {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

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
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span>📂</span>
            Kategoriyalar
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-slate-500 py-8">
              Yuklanmoqda...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              Kategoriyalar topilmadi
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-between ${
                      selectedCategory === cat.name_uz
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'text-slate-700 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(cat)}</span>
                      <span>{cat.name_uz}</span>
                    </div>
                    {cat.subcategories.length > 0 && (
                      <svg
                        className={`w-5 h-5 transition-transform ${
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
                    <div className="ml-6 mt-2 space-y-1">
                      <button
                        onClick={() => {
                          onCategorySelect(cat.name_uz)
                          onSubcategorySelect(cat.name_uz, '')
                          onClose()
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-all ${
                          selectedCategory === cat.name_uz && !selectedSubcategory
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-slate-600'
                        }`}
                      >
                        Barchasi
                      </button>
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategoryClick(cat.name_uz, sub.name_uz)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-all ${
                            selectedCategory === cat.name_uz && selectedSubcategory === sub.name_uz
                              ? 'bg-indigo-50 text-indigo-600 font-medium'
                              : 'text-slate-600'
                          }`}
                        >
                          {sub.name_uz}
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
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleClearFilter}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-medium transition-all"
          >
            🔄 Filtrni tozalash
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
