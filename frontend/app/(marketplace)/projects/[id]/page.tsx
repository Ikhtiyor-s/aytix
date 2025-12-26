'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { projectsService, Project, getImageUrl } from '@/services/adminApi'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Rasmlar ro'yxati
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
    if (params.id) {
      loadProject()
    }
  }, [params.id])

  const loadProject = async () => {
    try {
      const data = await projectsService.getProject(Number(params.id))
      setProject(data)
    } catch (error) {
      setError('Loyiha topilmadi')
    } finally {
      setLoading(false)
    }
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
      {/* Header */}
      <div className={`bg-gradient-to-r ${project.color || 'from-indigo-500 to-purple-600'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white mb-2 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Orqaga
          </button>
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              {project.is_top && (
                <span className="px-3 py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full">TOP</span>
              )}
              {project.is_new && (
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">YANGI</span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.name_uz}</h1>
            <p className="text-white/80 text-lg">{project.category}</p>
            {project.subcategory && (
              <p className="text-white/60 text-sm mt-1">{project.subcategory}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rasmlar galereyasi */}
            {mounted && allImages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Rasmlar</h2>
                <div className="relative">
                  {/* Asosiy rasm - to'liq ko'rinishda */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '600px' }}>
                    <img
                      src={allImages[currentImageIndex]}
                      alt={`${project.name_uz} - ${currentImageIndex + 1}`}
                      className="max-w-full max-h-[600px] object-contain"
                    />
                    {/* Strelkalar */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    {/* Rasm raqami */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    )}
                  </div>
                  {/* Thumbnail-lar */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
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
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Tavsif</h2>
              <p className="text-slate-600 leading-relaxed">
                {project.description_uz || 'Tavsif mavjud emas'}
              </p>
            </div>

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Xususiyatlar</h2>
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Texnologiyalar</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations */}
            {project.integrations && project.integrations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Integratsiyalar</h2>
                <div className="flex flex-wrap gap-2">
                  {project.integrations.map((integration, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Statistika</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ko'rishlar
                  </span>
                  <span className="font-semibold text-slate-900">{project.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Sevimlilar
                  </span>
                  <span className="font-semibold text-slate-900">{project.favorites}</span>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                Bog'lanish
              </button>
            </div>

            {/* Video Link - Market ochish */}
            {project.video_url && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Video</h3>
                <a
                  href={project.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="font-semibold">Videoni ko'rish</span>
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Ma'lumot</h3>
              <div className="space-y-3 text-sm">
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
      </div>
    </div>
  )
}
