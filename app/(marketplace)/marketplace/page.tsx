'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [mobileSearchValue, setMobileSearchValue] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [sidebarBottom, setSidebarBottom] = useState<number | null>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // URL parametrlari o'zgarganda search state'ni yangilash
  useEffect(() => {
    const searchQuery = searchParams.get('search') || ''
    setSearch(searchQuery)
    setPage(1)
  }, [searchParams])

  // Banner va footer scroll holatini kuzatish
  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const bannerBottom = bannerRef.current.getBoundingClientRect().bottom
        setIsScrolled(bannerBottom <= 56) // 56px = header height
      }

      // Footer bilan to'qnashuvni tekshirish
      if (contentRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const headerHeight = 56

        // Agar content pastki qismi viewport ichida bo'lsa
        if (contentRect.bottom < viewportHeight) {
          // Sidebar content bilan birga to'xtashi kerak
          setSidebarBottom(viewportHeight - contentRect.bottom)
        } else {
          setSidebarBottom(null)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <div ref={bannerRef}>
        <BannerSlider />
      </div>

      {/* Mobile Hamburger Menu - header ostida fixed */}
      <div className={`lg:hidden px-3 py-2 bg-white border-b border-slate-100 z-30 ${isScrolled ? 'fixed top-[56px] left-0 right-0' : ''}`}>
        <div className="flex items-center justify-between">
          {/* Kategoriyalar tugmasi */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center gap-2 p-2 text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">
              {selectedCategory || 'Kategoriyalar'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${showMobileFilter ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Qidiruv tugmasi */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className={`p-2 rounded-full transition-colors ${showMobileSearch ? 'bg-indigo-100 text-indigo-600' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Mobil qidiruv input */}
        {showMobileSearch && (
          <div className="mt-2 pb-1">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSearch(mobileSearchValue)
                setPage(1)
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={mobileSearchValue}
                  onChange={(e) => setMobileSearchValue(e.target.value)}
                  placeholder="Loyihalarni qidirish..."
                  className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
                {mobileSearchValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSearchValue('')
                      setSearch('')
                      setPage(1)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Qidirish
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Spacer for fixed mobile menu */}
      {isScrolled && <div className="lg:hidden h-[44px]" />}

      {/* Main Content with Mobile Sidebar */}
      <div className="w-full px-3 sm:px-4 py-4 sm:py-8 relative">
        {/* Mobile Category Filter */}
        <MobileCategoryFilter
          isOpen={showMobileFilter}
          onClose={() => setShowMobileFilter(false)}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
        />

        <div ref={contentRef} className="flex gap-4 lg:gap-8">
          {/* Sidebar Categories (faqat desktop) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div
              className={`w-72 overflow-y-auto transition-all duration-200 ${
                isScrolled ? 'fixed' : 'relative'
              }`}
              style={{
                top: isScrolled ? '56px' : 'auto',
                bottom: sidebarBottom !== null ? `${sidebarBottom}px` : 'auto',
                height: isScrolled && sidebarBottom === null ? 'calc(100vh - 56px)' : 'auto',
                maxHeight: isScrolled ? 'calc(100vh - 56px)' : 'calc(100vh - 200px)'
              }}
            >
              <div className={isScrolled ? 'py-4 pr-4' : ''}>
                <CategoriesSidebar
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  onCategorySelect={handleCategorySelect}
                  onSubcategorySelect={handleSubcategorySelect}
                />
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <main className="flex-1 min-w-0">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="w-full">
                      <ProjectCard project={project} />
                    </div>
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
