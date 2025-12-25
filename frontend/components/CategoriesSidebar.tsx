'use client'

import { useState } from 'react'
import { categoriesData, CategoryWithSubs } from '@/lib/categories'

interface CategoriesSidebarProps {
  selectedCategory?: number
  selectedSubcategory?: string
  onCategorySelect: (categoryId: number | undefined) => void
  onSubcategorySelect: (categoryId: number, subcategory: string) => void
}

export default function CategoriesSidebar({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
}: CategoriesSidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  const toggleCategory = (catId: number) => {
    if (expandedCategory === catId) {
      setExpandedCategory(null)
      onCategorySelect(undefined)
    } else {
      setExpandedCategory(catId)
      onCategorySelect(catId)
    }
  }

  const handleSubcategoryClick = (categoryId: number, subcategory: string) => {
    onSubcategorySelect(categoryId, subcategory)
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
          <div className="space-y-2">
            {categoriesData.map((cat) => (
              <div key={cat.id} className="mb-2">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-between ${
                    expandedCategory === cat.id
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
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
                      onCategorySelect(cat.id)
                      onSubcategorySelect(cat.id, '')
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-indigo-50 transition-all font-semibold ${
                      selectedCategory === cat.id && !selectedSubcategory
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-indigo-700'
                    }`}
                  >
                    📋 Barchasi
                  </button>
                  {cat.subcategories.map((sub, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubcategoryClick(cat.id, sub)}
                      className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-indigo-50 transition-all ${
                        selectedCategory === cat.id && selectedSubcategory === sub
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'text-slate-600'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

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

