'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { projectsService, Project } from '@/services/adminApi'
import BannerSlider from '@/components/BannerSlider'
import CategoriesSidebar from '@/components/CategoriesSidebar'
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar Categories */}
          <CategoriesSidebar
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
          />

          {/* Projects Grid */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedCategory ? selectedCategory : 'Barcha loyihalar'}
              </h2>
              <span className="text-slate-600">{projects.length} ta loyiha</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {projects.length >= 20 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-slate-50"
                    >
                      Oldingi
                    </button>
                    <span className="px-4 py-2">Sahifa {page}</span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-2 border rounded-md hover:bg-slate-50"
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
