'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())

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

  // Hozirgi banner video ekanligini aniqlash
  const isCurrentBannerVideo = useCallback(() => {
    if (!banners[currentIndex]) return false
    const videoUrl = getImageUrl(banners[currentIndex].video_url)
    return !!(videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg')))
  }, [banners, currentIndex])

  // Video tugaganda keyingi bannerga o'tish
  const handleVideoEnded = useCallback(() => {
    setIsVideoPlaying(false)
    goToNext()
  }, [goToNext])

  // Hozirgi banner o'zgarganda video holatini yangilash
  useEffect(() => {
    if (isCurrentBannerVideo()) {
      setIsVideoPlaying(true)
      // Video elementini boshidan boshlash
      const videoEl = videoRefs.current.get(currentIndex)
      if (videoEl) {
        videoEl.currentTime = 0
        videoEl.play().catch(() => {})
      }
    } else {
      setIsVideoPlaying(false)
    }
  }, [currentIndex, isCurrentBannerVideo])

  // Avtomatik aylanish - faqat rasm bannerlarda (video bo'lsa to'xtaydi)
  useEffect(() => {
    if (banners.length <= 1) return
    if (isVideoPlaying) return

    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [banners.length, goToNext, isVideoPlaying])

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
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden w-full aspect-[1920/480] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  // Xatolik bo'lsa yoki banner yo'q bo'lsa - hech narsa ko'rsatmaslik
  if (error || banners.length === 0) {
    return null
  }

  return (
    <div
      className="relative group overflow-hidden w-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => {
          const bannerImg = getImageUrl(banner.image_url)
          const bannerVideo = getImageUrl(banner.video_url)
          const isBannerVideo = bannerVideo && (bannerVideo.endsWith('.mp4') || bannerVideo.endsWith('.webm') || bannerVideo.endsWith('.ogg'))

          return (
            <div key={banner.id} className="relative w-full flex-shrink-0 aspect-[1920/480] bg-black">
              {/* Banner media */}
              {isBannerVideo ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(banners.indexOf(banner), el)
                  }}
                  src={bannerVideo}
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-contain"
                />
              ) : bannerImg ? (
                <img
                  src={bannerImg}
                  alt={banner.title_uz}
                  className="w-full h-full object-contain"
                />
              ) : null}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 w-full px-[4%] flex items-end justify-start pb-[3%]">
                <div className="max-w-[40%] text-white text-left">
                  <h2 className="text-[clamp(14px,2.5vw,40px)] font-bold mb-[0.5%] line-clamp-2 whitespace-pre-line">
                    {language.code === 'ru' && banner.title_ru ? banner.title_ru : language.code === 'en' && banner.title_en ? banner.title_en : banner.title_uz}
                  </h2>
                  {(banner.description_uz || banner.description_ru || banner.description_en) && (
                    <p className="text-[clamp(10px,1.5vw,18px)] mb-[2%] line-clamp-2 whitespace-pre-line">
                      {language.code === 'ru' && banner.description_ru ? banner.description_ru : language.code === 'en' && banner.description_en ? banner.description_en : banner.description_uz}
                    </p>
                  )}
                  {banner.link_url && (
                    <Link
                      href={banner.link_url}
                      className="px-[1.5vw] py-[0.8vw] bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all inline-block text-[clamp(10px,1.2vw,14px)]"
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

      {/* Navigation Arrows - faqat desktopda ko'rsatiladi */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-[1%] top-1/2 -translate-y-1/2 w-[2.5vw] h-[2.5vw] min-w-[28px] min-h-[28px] bg-white/20 backdrop-blur-sm hover:bg-white/50 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-[1.5vw] h-[1.5vw] min-w-[14px] min-h-[14px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-[1%] top-1/2 -translate-y-1/2 w-[2.5vw] h-[2.5vw] min-w-[28px] min-h-[28px] bg-white/20 backdrop-blur-sm hover:bg-white/50 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-[1.5vw] h-[1.5vw] min-w-[14px] min-h-[14px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
