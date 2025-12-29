'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@/types'
import { formatPrice } from '@/utils/formatters'

interface ProductCardProps {
  product: Product
  badge?: 'TOP' | 'PREMIUM' | 'YANGI' | 'MASHHUR'
}

export default function ProductCard({ product, badge }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const badgeColors = {
    TOP: 'bg-yellow-400 text-slate-900',
    PREMIUM: 'bg-purple-500 text-white',
    YANGI: 'bg-green-500 text-white',
    MASHHUR: 'bg-red-500 text-white',
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {badge && (
          <span
            className={`absolute top-4 left-4 px-3 py-1 ${badgeColors[badge]} text-xs font-bold rounded-full`}
          >
            {badge}
          </span>
        )}
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-slate-400'}`}
            fill="none"
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
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
        )}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-indigo-600">{formatPrice(product.price)}</span>
            <span className="text-sm text-slate-500">Stock: {product.stock}</span>
          </div>
          {product.category && (
            <span className="text-sm text-slate-500">{product.category.name}</span>
          )}
        </div>
      </div>
    </Link>
  )
}



