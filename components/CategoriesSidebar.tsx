'use client'

import { useState, useEffect } from 'react'
import { categoryProjectsService, CategoryProject, SubcategoryProject } from '@/services/adminApi'

interface CategoryWithSubs extends CategoryProject {
  subcategories: SubcategoryProject[]
}

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
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const cats = await categoryProjectsService.getCategories(true)
      // Load subcategories for each category
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
      // Yopish
      setExpandedCategory(null)
      onCategorySelect(undefined)
    } else {
      // Ochish
      setExpandedCategory(cat.id)
      onCategorySelect(cat.name_uz)
      onSubcategorySelect(cat.name_uz, '')
    }
  }

  const handleSubcategoryClick = (categoryName: string, subcategory: string) => {
    onSubcategorySelect(categoryName, subcategory)
  }

  // Kategoriya nomiga qarab icon olish
  const getCategoryIcon = (cat: CategoryWithSubs) => {
    // Agar icon bo'sh yoki raqamli emoji bo'lsa, kategoriya nomiga qarab icon qaytarish
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="text-xl">📂</span>
            Kategoriyalar
          </h2>
        </div>
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          Yuklanmoqda...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-sm">
          <span className="text-base">📂</span>
          Kategoriyalar
        </h2>
      </div>
      <div className="p-2 flex-1 overflow-y-auto categories-scroll min-h-0">
        {categories.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-4">
            Kategoriyalar topilmadi
          </div>
        ) : (
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-between ${
                    selectedCategory === cat.name_uz
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getCategoryIcon(cat)}</span>
                    <span className="text-xs">{cat.name_uz}</span>
                  </div>
                  {cat.subcategories.length > 0 && (
                    <svg
                      className={`w-4 h-4 transition-transform ${
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
                  <div className="ml-6 mt-0.5 space-y-0.5">
                    <button
                      onClick={() => {
                        onCategorySelect(cat.name_uz)
                        onSubcategorySelect(cat.name_uz, '')
                      }}
                      className={`w-full text-left px-2 py-1 text-xs rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all ${
                        selectedCategory === cat.name_uz && !selectedSubcategory
                          ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Barchasi
                    </button>
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubcategoryClick(cat.name_uz, sub.name_uz)}
                        className={`w-full text-left px-2 py-1 text-xs rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all ${
                          selectedCategory === cat.name_uz && selectedSubcategory === sub.name_uz
                            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400'
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

        <button
          onClick={() => {
            setExpandedCategory(null)
            onCategorySelect(undefined)
          }}
          className="w-full mt-2 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all text-xs"
        >
          🔄 Filtrni tozalash
        </button>
      </div>
    </div>
  )
}
