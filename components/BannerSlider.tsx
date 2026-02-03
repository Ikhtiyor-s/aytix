'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { bannersService, getImageUrl, Banner } from '@/services/adminApi'
import { useLanguage } from '@/contexts/LanguageContext'

export default function BannerSlider() {
  const { t, language } = useLanguage()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

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
        setError(false)
      } catch (err) {
        console.error('Bannerlarni olishda xatolik:', err)
        setError(true)
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

  // Touch swipe handlers
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrev()
    }
  }

  // Server-side va mount bo'lmagan holat - loading ko'rsatish
  if (!mounted || loading) {
    return (
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  // Xatolik bo'lsa yoki banner yo'q bo'lsa - hech narsa ko'rsatmaslik
  if (error || banners.length === 0) {
    return null
  }

  // Joriy banner
  const currentBanner = banners[currentIndex]
  const imageUrl = getImageUrl(currentBanner.image_url)
  const videoUrl = getImageUrl(currentBanner.video_url)
  const isVideo = videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg'))

  return (
    <div
      className="relative group overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Banner media */}
      {isVideo ? (
        <video
          key={currentBanner.id}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-auto block transition-opacity duration-500"
        />
      ) : imageUrl ? (
        <img
          key={currentBanner.id}
          src={imageUrl}
          alt={currentBanner.title_uz}
          className="w-full h-auto block transition-opacity duration-500"
        />
      ) : null}

      {/* Overlay gradient - matn o'qilishi uchun */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 w-full px-4 sm:px-16 md:px-20 flex items-end justify-start pb-4 sm:pb-6 md:pb-8">
        <div className="max-w-lg text-white text-left">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 line-clamp-2 whitespace-pre-line">
            {language.code === 'ru' && currentBanner.title_ru ? currentBanner.title_ru : language.code === 'en' && currentBanner.title_en ? currentBanner.title_en : currentBanner.title_uz}
          </h2>
          {(currentBanner.description_uz || currentBanner.description_ru || currentBanner.description_en) && (
            <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4 line-clamp-2 hidden sm:block whitespace-pre-line">
              {language.code === 'ru' && currentBanner.description_ru ? currentBanner.description_ru : language.code === 'en' && currentBanner.description_en ? currentBanner.description_en : currentBanner.description_uz}
            </p>
          )}
          {currentBanner.link_url && (
            <Link
              href={currentBanner.link_url}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-indigo-600 font-semibold rounded-lg sm:rounded-xl hover:bg-indigo-50 transition-all inline-block text-xs sm:text-sm"
            >
              {t('banner.details')} →
            </Link>
          )}
        </div>
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

      {/* Navigation Arrows - faqat desktopda ko'rsatiladi */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/50 rounded-full items-center justify-center transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/50 rounded-full items-center justify-center transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
