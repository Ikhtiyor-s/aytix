'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { bannersService, getImageUrl, Banner } from '@/services/adminApi'
import { useLanguage } from '@/contexts/LanguageContext'

export default function BannerSlider() {
  const { t, language } = useLanguage()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Bannerlarni API dan olish
  useEffect(() => {
    if (!mounted) return

    const fetchBanners = async () => {
      try {
        const data = await bannersService.getBanners()
        setBanners(data)
      } catch (error) {
        console.error('Bannerlarni olishda xatolik:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [mounted])

  // Keyingi bannerga o'tish
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  // Oldingi bannerga o'tish
  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // Avtomatik aylanish
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [banners.length, goToNext])

  // Server-side va mount bo'lmagan holat - loading ko'rsatish
  if (!mounted || loading) {
    return (
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden aspect-[2/1] sm:aspect-[3/1] md:aspect-[4/1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  // Banner yo'q bo'lsa
  if (banners.length === 0) {
    return null
  }

  return (
    <div className="relative group overflow-hidden aspect-[2/1] sm:aspect-[3/1] md:aspect-[4/1]">
      {/* Banners container */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => {
          const imageUrl = getImageUrl(banner.image_url)
          const videoUrl = getImageUrl(banner.video_url)
          const isVideo = videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg'))

          return (
            <div
              key={banner.id}
              className="relative flex-shrink-0 w-full h-full"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600" />

              {/* Banner video */}
              {isVideo && (
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              )}

              {/* Banner rasm yoki GIF */}
              {!isVideo && imageUrl && (
                <img
                  src={imageUrl}
                  alt={banner.title_uz}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              )}

              {/* Overlay gradient - matn o'qilishi uchun */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />

              {/* Content */}
              <div className="relative w-full px-4 sm:px-16 md:px-20 h-full flex items-end justify-start pb-4 sm:pb-6 md:pb-8">
                <div className="max-w-lg text-white text-left">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 line-clamp-2">
                    {language.code === 'ru' && banner.title_ru ? banner.title_ru : language.code === 'en' && banner.title_en ? banner.title_en : banner.title_uz}
                  </h2>
                  {(banner.description_uz || banner.description_ru || banner.description_en) && (
                    <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4 line-clamp-2 hidden sm:block">
                      {language.code === 'ru' && banner.description_ru ? banner.description_ru : language.code === 'en' && banner.description_en ? banner.description_en : banner.description_uz}
                    </p>
                  )}
                  {banner.link_url && (
                    <Link
                      href={banner.link_url}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-indigo-600 font-semibold rounded-lg sm:rounded-xl hover:bg-indigo-50 transition-all inline-block text-xs sm:text-sm"
                    >
                      {t('banner.details')} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows - ko'rsatiladi hover qilinganda */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/30 backdrop-blur-sm hover:bg-white/60 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/30 backdrop-blur-sm hover:bg-white/60 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
