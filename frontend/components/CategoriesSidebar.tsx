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
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [loading, setLoading] = useState(true)

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

  const toggleCategory = (cat: CategoryWithSubs) => {
    if (expandedCategory === cat.id) {
      setExpandedCategory(null)
      onCategorySelect(undefined)
    } else {
      setExpandedCategory(cat.id)
      onCategorySelect(cat.name_uz)
    }
  }

  const handleSubcategoryClick = (categoryName: string, subcategory: string) => {
    onSubcategorySelect(categoryName, subcategory)
  }

  if (loading) {
    return (
      <aside className="w-80 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="text-xl">📂</span>
              Kategoriyalar
            </h2>
          </div>
          <div className="p-4 text-center text-slate-500">
            Yuklanmoqda...
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-80 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="text-xl">📂</span>
            Kategoriyalar
          </h2>
        </div>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
          {categories.length === 0 ? (
            <div className="text-center text-slate-500 py-4">
              Kategoriyalar topilmadi
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="mb-2">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-between ${
                      expandedCategory === cat.id
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon || '📁'}</span>
                      <span className="text-sm">{cat.name_uz}</span>
                    </div>
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
                  </button>

                  {/* Subcategories */}
                  <div
                    className={`ml-8 mt-2 space-y-1 transition-all ${
                      expandedCategory === cat.id ? 'block' : 'hidden'
                    }`}
                  >
                    <button
                      onClick={() => {
                        onCategorySelect(cat.name_uz)
                        onSubcategorySelect(cat.name_uz, '')
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-indigo-50 transition-all font-semibold ${
                        selectedCategory === cat.name_uz && !selectedSubcategory
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-indigo-700'
                      }`}
                    >
                      📋 Barchasi
                    </button>
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubcategoryClick(cat.name_uz, sub.name_uz)}
                        className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-indigo-50 transition-all ${
                          selectedCategory === cat.name_uz && selectedSubcategory === sub.name_uz
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-slate-600'
                        }`}
                      >
                        {sub.name_uz}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setExpandedCategory(null)
              onCategorySelect(undefined)
            }}
            className="w-full mt-4 px-4 py-3 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-medium transition-all"
          >
            🔄 Filtrni tozalash
          </button>
        </div>
      </div>
    </aside>
  )
}
