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
      <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-[60px] self-start">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-h-[calc(100vh-76px)] flex flex-col">
          <div className="p-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="text-xl">📂</span>
              Kategoriyalar
            </h2>
          </div>
          <div className="p-4 text-center text-slate-500 flex-1">
            Yuklanmoqda...
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-[60px] self-start">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-h-[calc(100vh-76px)] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="text-xl">📂</span>
            Kategoriyalar
          </h2>
        </div>
        <div className="p-3 flex-1 overflow-y-auto categories-scroll min-h-0">
          {categories.length === 0 ? (
            <div className="text-center text-slate-500 py-4">
              Kategoriyalar topilmadi
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-between ${
                      selectedCategory === cat.name_uz
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(cat)}</span>
                      <span className="text-sm">{cat.name_uz}</span>
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
                    <div className="ml-8 mt-1 space-y-1">
                      <button
                        onClick={() => {
                          onCategorySelect(cat.name_uz)
                          onSubcategorySelect(cat.name_uz, '')
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-indigo-50 transition-all ${
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
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-indigo-50 transition-all ${
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

          <button
            onClick={() => {
              setExpandedCategory(null)
              onCategorySelect(undefined)
            }}
            className="w-full mt-4 px-4 py-2.5 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-medium transition-all text-sm"
          >
            🔄 Filtrni tozalash
          </button>
        </div>
      </div>
    </aside>
  )
}
