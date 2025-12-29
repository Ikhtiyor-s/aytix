'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { bannersService, getImageUrl, Banner } from '@/services/adminApi'

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

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

  // Auto-slide
  useEffect(() => {
    if (banners.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  const goToBanner = (index: number) => {
    setCurrentIndex(index)
  }

  const nextBanner = () => {
    if (banners.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    if (banners.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  // Server-side va mount bo'lmagan holat - loading ko'rsatish
  if (!mounted || loading) {
    return (
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden h-[200px] sm:h-[280px] md:h-[350px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  // Banner yo'q bo'lsa
  if (banners.length === 0) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden h-[200px] sm:h-[280px] md:h-[350px]">
      {banners.map((banner, index) => {
        const imageUrl = getImageUrl(banner.image_url)
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: imageUrl
                ? `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url('${imageUrl}')`
                : 'linear-gradient(to right, rgba(79, 70, 229, 1), rgba(147, 51, 234, 1))',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="w-full px-4 sm:px-16 md:px-20 h-full flex items-end justify-start pb-4 sm:pb-6 md:pb-8">
              <div className="max-w-lg text-white text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 line-clamp-2">{banner.title_uz}</h2>
                {banner.description_uz && (
                  <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4 line-clamp-2 hidden sm:block">{banner.description_uz}</p>
                )}
                {banner.link_url && (
                  <Link
                    href={banner.link_url}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-indigo-600 font-semibold rounded-lg sm:rounded-xl hover:bg-indigo-50 transition-all inline-block text-xs sm:text-sm"
                  >
                    Batafsil →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation Arrows - faqat tablet va desktop */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="hidden sm:flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/30 backdrop-blur-sm hover:bg-white/60 rounded-full items-center justify-center transition-all hover:scale-110 z-10"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            onClick={nextBanner}
            className="hidden sm:flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/30 backdrop-blur-sm hover:bg-white/60 rounded-full items-center justify-center transition-all hover:scale-110 z-10"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToBanner(idx)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-5 sm:w-8' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
