'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { projectsService, Project } from '@/services/adminApi'
import BannerSlider from '@/components/BannerSlider'
import CategoriesSidebar from '@/components/CategoriesSidebar'
import MobileCategoryFilter from '@/components/MobileCategoryFilter'
import ProjectCard from '@/components/ProjectCard'
import Loading from '@/components/ui/Loading'

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // URL parametrlari o'zgarganda search state'ni yangilash
  useEffect(() => {
    const searchQuery = searchParams.get('search') || ''
    setSearch(searchQuery)
    setPage(1)
  }, [searchParams])

  useEffect(() => {
    loadProjects()
  }, [page, selectedCategory, selectedSubcategory, search])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const searchQuery = selectedSubcategory
        ? `${search} ${selectedSubcategory}`.trim()
        : search || undefined

      const data = await projectsService.getProjects({
        skip: (page - 1) * 20,
        limit: 20,
        category: selectedCategory,
        search: searchQuery,
        status: 'active',
      })
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryName: string | undefined) => {
    setSelectedCategory(categoryName)
    setSelectedSubcategory(undefined)
    setPage(1)
  }

  const handleSubcategorySelect = (categoryName: string, subcategory: string) => {
    setSelectedCategory(categoryName)
    setSelectedSubcategory(subcategory || undefined)
    setPage(1)
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex gap-4 lg:gap-8 items-start">
          {/* Sidebar Categories - sticky (faqat desktop) */}
          <CategoriesSidebar
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
          />

          {/* Projects Grid */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilter(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Kategoriyalar</span>
                {selectedCategory && (
                  <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                    {selectedCategory}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Category Filter Modal */}
            <MobileCategoryFilter
              isOpen={showMobileFilter}
              onClose={() => setShowMobileFilter(false)}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
            />

            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
                {selectedCategory ? selectedCategory : 'Barcha loyihalar'}
              </h2>
              <span className="text-sm sm:text-base text-slate-600">{projects.length} ta loyiha</span>
            </div>

            {loading ? (
              <Loading text="Loyihalar yuklanmoqda..." />
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="mb-4">Loyihalar topilmadi</p>
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory(undefined)
                    setSelectedSubcategory(undefined)
                  }}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Filtrni tozalash
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {projects.length >= 20 && (
                  <div className="mt-6 sm:mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md disabled:opacity-50 hover:bg-slate-50"
                    >
                      Oldingi
                    </button>
                    <span className="px-3 sm:px-4 py-2 text-sm sm:text-base">Sahifa {page}</span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md hover:bg-slate-50"
                    >
                      Keyingi
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
