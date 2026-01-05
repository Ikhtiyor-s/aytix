'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { projectsService, Project } from '@/services/adminApi'
import BannerSlider from '@/components/BannerSlider'
import CategoriesSidebar from '@/components/CategoriesSidebar'
import MobileCategoryFilter from '@/components/MobileCategoryFilter'
import ProjectCard from '@/components/ProjectCard'
import Loading from '@/components/ui/Loading'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MarketplacePage() {
  const { t } = useLanguage()
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
  const [sidebarHeight, setSidebarHeight] = useState<string>('calc(100vh - 56px)')
  const [navbarHeight, setNavbarHeight] = useState<number>(56)
  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarContainerRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const categoryButtonRef = useRef<HTMLButtonElement>(null)

  // Qidiruv inputi tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // Qidiruv tugmasiga bosilgan bo'lsa, yopmaslik (toggle ishlaydi)
      if (searchButtonRef.current && searchButtonRef.current.contains(target)) {
        return
      }
      // Input tashqarisiga bosilgan bo'lsa yopish
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setShowMobileSearch(false)
      }
    }

    if (showMobileSearch) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMobileSearch])

  // Navbar balandligini aniqlash
  useEffect(() => {
    const navbar = document.querySelector('header')
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight)
    }
  }, [])

  // URL parametrlari o'zgarganda search state'ni yangilash
  useEffect(() => {
    const searchQuery = searchParams.get('search') || ''
    setSearch(searchQuery)
    setPage(1)
  }, [searchParams])

  // Footer pozitsiyasiga qarab sidebar balandligini o'zgartirish
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer')
      if (footer) {
        const footerRect = footer.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const navHeight = 56

        // Agar footer ekranga kirgan bo'lsa
        if (footerRect.top < viewportHeight) {
          const availableHeight = footerRect.top - navHeight
          setSidebarHeight(`${Math.max(100, availableHeight)}px`)
        } else {
          setSidebarHeight(`calc(100vh - ${navHeight}px)`)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
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
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Mobile Hamburger Menu */}
      <div
        className="lg:hidden sticky z-40 px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-700"
        style={{ top: `${navbarHeight}px` }}
      >
        <div className="flex items-center justify-between">
          {/* Kategoriyalar tugmasi */}
          <button
            ref={categoryButtonRef}
            onClick={() => {
              setShowMobileFilter(!showMobileFilter)
              setShowMobileSearch(false)
            }}
            className="flex items-center gap-2 p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">
              {selectedCategory || t('categories.all')}
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
            ref={searchButtonRef}
            onClick={() => {
              setShowMobileSearch(!showMobileSearch)
              setShowMobileFilter(false)
            }}
            className={`p-2 rounded-full transition-colors ${showMobileSearch ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Mobil qidiruv input */}
        {showMobileSearch && (
          <div ref={mobileSearchRef} className="mt-2 pb-1">
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
                  placeholder={t('marketplace.searchPlaceholder')}
                  className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                {t('common.search')}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Main Content - navbar ostidan boshlanadi */}
      <div className="w-full relative">
        {/* Mobile Category Filter */}
        <MobileCategoryFilter
          isOpen={showMobileFilter}
          onClose={() => setShowMobileFilter(false)}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          triggerButtonRef={categoryButtonRef}
        />

        {/* Fixed Sidebar Categories (faqat desktop) */}
        <div className="hidden lg:block fixed left-0 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto z-40 transition-all duration-150" style={{ top: '56px', height: sidebarHeight }}>
          <div className="px-3 pt-8 pb-4">
            <CategoriesSidebar
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
            />
          </div>
        </div>

        <div ref={contentRef} className="flex gap-0">
          {/* Sidebar uchun bo'sh joy (faqat desktop) */}
          <div className="hidden lg:block w-72 flex-shrink-0" />

          {/* O'ng tomon - Banner va Projects */}
          <div className="flex-1 min-w-0">
            {/* Banner Slider - kategoriyalar yonida */}
            <BannerSlider />

            {/* Projects Grid */}
            <main className="px-3 sm:px-4 py-4 sm:py-8">
              <div className="mb-4 sm:mb-6 flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedCategory ? selectedCategory : t('marketplace.allProjects')}
                </h2>
                <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{projects.length} {t('marketplace.projects')}</span>
              </div>

              {loading ? (
                <Loading text={t('marketplace.loadingProjects')} />
              ) : projects.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="mb-4">{t('marketplace.noProjects')}</p>
                  <button
                    onClick={() => {
                      setSearch('')
                      setSelectedCategory(undefined)
                      setSelectedSubcategory(undefined)
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    {t('common.clearFilter')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
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
                        className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {t('common.prev')}
                      </button>
                      <span className="px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-700 dark:text-slate-300">{t('common.page')} {page}</span>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {t('common.next')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
