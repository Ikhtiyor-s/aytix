'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Banner {
  id: number
  projectId: number
  image: string
  title: string
  description: string
}

const banners: Banner[] = [
  {
    id: 1,
    projectId: 1,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&h=500&fit=crop',
    title: 'AmoCRM - 20% chegirma!',
    description: 'Professional CRM sozlash 1500$ dan',
  },
  {
    id: 2,
    projectId: 16,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&h=500&fit=crop',
    title: 'AI Chatbot Pro - GPT-4!',
    description: '24/7 mijozlarga xizmat. 3 tilda!',
  },
  {
    id: 3,
    projectId: 19,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1400&h=500&fit=crop',
    title: 'Mobil Ilova - Flutter!',
    description: 'Bir kod - ikki platforma!',
  },
]

export default function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const goToBanner = (index: number) => {
    setCurrentIndex(index)
  }

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden h-[300px]">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url('${banner.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '300px',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 h-[300px] flex items-center">
            <div className="max-w-2xl text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{banner.title}</h2>
              <p className="text-base md:text-lg mb-4">{banner.description}</p>
              <Link
                href={`/products/${banner.projectId}`}
                className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all inline-block text-sm"
              >
                Batafsil →
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevBanner}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
      >
        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
      >
        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToBanner(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

