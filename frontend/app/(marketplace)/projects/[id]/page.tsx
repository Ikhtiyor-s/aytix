'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { projectsService, Project, getImageUrl } from '@/services/adminApi'
import CategoriesSidebar from '@/components/CategoriesSidebar'
import ProjectCard from '@/components/ProjectCard'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [similarProjects, setSimilarProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>()
  const [isFavorite, setIsFavorite] = useState(false)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // localStorage dan sevimlilarni tekshirish
  useEffect(() => {
    if (project) {
      const savedFavorites = localStorage.getItem('favoriteProjects')
      if (savedFavorites) {
        try {
          const favorites: Project[] = JSON.parse(savedFavorites)
          setIsFavorite(favorites.some(f => f.id === project.id))
        } catch (e) {
          console.error('Failed to load favorites', e)
        }
      }
    }
  }, [project])

  const allImages = useMemo(() => {
    if (!project) return []
    const images: string[] = []
    if (project.image_url) {
      const url = getImageUrl(project.image_url)
      if (url) images.push(url)
    }
    if (project.images && Array.isArray(project.images)) {
      project.images.forEach(img => {
        const url = getImageUrl(img)
        if (url) images.push(url)
      })
    }
    return images
  }, [project])

  useEffect(() => {
    if (params.id && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      loadProject()
    }
  }, [params.id])

  const loadProject = async () => {
    try {
      const data = await projectsService.getProject(Number(params.id))
      setProject(data)

      // O'xshash loyihalarni yuklash (shu kategoriyadan)
      if (data.category) {
        const allProjects = await projectsService.getProjects({ category: data.category })
        // Hozirgi loyihani chiqarib tashlash va faqat 4 ta ko'rsatish
        const similar = allProjects.filter(p => p.id !== data.id).slice(0, 4)
        setSimilarProjects(similar)
      }
    } catch (error) {
      setError('Loyiha topilmadi')
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryName: string | undefined) => {
    if (categoryName) {
      router.push(`/marketplace?category=${encodeURIComponent(categoryName)}`)
    } else {
      router.push('/marketplace')
    }
  }

  const handleSubcategorySelect = (categoryName: string, subcategory: string) => {
    router.push(`/marketplace?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategory)}`)
  }

  const toggleFavorite = () => {
    if (!project) return

    const savedFavorites = localStorage.getItem('favoriteProjects')
    let favorites: Project[] = []

    if (savedFavorites) {
      try {
        favorites = JSON.parse(savedFavorites)
      } catch (e) {
        console.error('Failed to parse favorites', e)
      }
    }

    if (isFavorite) {
      // Sevimlilardan olib tashlash
      favorites = favorites.filter(f => f.id !== project.id)
    } else {
      // Sevimlilarga qo'shish
      favorites.push(project)
    }

    localStorage.setItem('favoriteProjects', JSON.stringify(favorites))
    setIsFavorite(!isFavorite)

    // Custom event yuborish - FavoritesDropdown yangilanishi uchun
    window.dispatchEvent(new CustomEvent('favoritesUpdated'))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <p className="text-slate-600 mb-4">{error || 'Loyiha topilmadi'}</p>
          <Link href="/marketplace" className="text-indigo-600 hover:text-indigo-500">
            Marketga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-4 lg:gap-8">
          {/* Categories Sidebar - sticky (faqat desktop) */}
          <CategoriesSidebar
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Orqaga tugmasi va sarlavha */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="text-slate-600 hover:text-slate-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Orqaga
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 sm:p-3 rounded-full transition-all ${
                    isFavorite
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-400'
                  }`}
                  title={isFavorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                {project.is_top && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full">TOP</span>
                )}
                {project.is_new && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white text-xs font-bold rounded-full">YANGI</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">{project.name_uz}</h1>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg">{project.category}</p>
              {project.subcategory && (
                <p className="text-slate-500 text-xs sm:text-sm mt-1">{project.subcategory}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Project Details */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Rasmlar */}
                {mounted && allImages.length > 0 && (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Rasmlar</h2>
                    <div className="relative">
                      <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ minHeight: '200px', maxHeight: '500px' }}>
                        <img
                          src={allImages[currentImageIndex]}
                          alt={`${project.name_uz} - ${currentImageIndex + 1}`}
                          className="max-w-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px] object-contain"
                        />
                        {allImages.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                            >
                              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                            >
                              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                        {allImages.length > 1 && (
                          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-black/50 rounded-full text-white text-xs sm:text-sm">
                            {currentImageIndex + 1} / {allImages.length}
                          </div>
                        )}
                      </div>
                      {allImages.length > 1 && (
                        <div className="flex gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2">
                          {allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 ${
                                idx === currentImageIndex ? 'border-indigo-500' : 'border-transparent hover:border-slate-300'
                              }`}
                            >
                              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Tavsif</h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {project.description_uz || 'Tavsif mavjud emas'}
                  </p>
                </div>

                {/* Features */}
                {project.features && project.features.length > 0 && (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Xususiyatlar</h2>
                    <ul className="space-y-2 sm:space-y-3">
                      {project.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm sm:text-base text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Texnologiyalar</h2>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs sm:text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Integrations */}
                {project.integrations && project.integrations.length > 0 && (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Integratsiyalar</h2>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {project.integrations.map((integration, index) => (
                        <span key={index} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
                          {integration}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4 sm:space-y-6">
                {/* Stats */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Statistika</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-slate-600 flex items-center gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ko'rishlar
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-slate-900">{project.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-slate-600 flex items-center gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Sevimlilar
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-slate-900">{project.favorites}</span>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                  <a
                    href="https://t.me/Ikhtiyor_sb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Bog'lanish
                  </a>
                </div>

                {/* Video */}
                {project.video_url && (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Video</h3>
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={getImageUrl(project.video_url) || ''}
                    >
                      Brauzeringiz video formatini qo'llab-quvvatlamaydi.
                    </video>
                  </div>
                )}

                {/* Info */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Ma'lumot</h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className={`font-medium ${project.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                        {project.status === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Qo'shilgan</span>
                      <span className="text-slate-900">
                        {new Date(project.created_at).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* O'xshash loyihalar */}
            {similarProjects.length > 0 && (
              <div className="mt-8 sm:mt-12">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">O'xshash loyihalar</h2>
                  <Link
                    href={`/marketplace?category=${encodeURIComponent(project.category)}`}
                    className="text-sm sm:text-base text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    Barchasini ko'rish
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {similarProjects.map((similarProject) => (
                    <ProjectCard key={similarProject.id} project={similarProject} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
