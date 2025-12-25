'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { productsService, Product } from '@/services/products'
import BannerSlider from '@/components/BannerSlider'
import CategoriesSidebar from '@/components/CategoriesSidebar'
import ProductCard from '@/components/ProductCard'
import Loading from '@/components/ui/Loading'

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [page, selectedCategory, selectedSubcategory, search])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Agar subcategory tanlangan bo'lsa, search query'ga qo'shamiz
      // Agar "Barchasi" tanlangan bo'lsa (selectedSubcategory undefined), faqat kategoriya filtri qo'llanadi
      const searchQuery = selectedSubcategory
        ? `${search} ${selectedSubcategory}`.trim()
        : search || undefined

      const data = await productsService.getProducts(
        page,
        20,
        selectedCategory,
        searchQuery
      )
      setProducts(data.items)
      setTotalPages(data.pages)
    } catch (error) {
      console.error('Failed to load products', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryId: number | undefined) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(undefined)
    setPage(1)
  }

  const handleSubcategorySelect = (categoryId: number, subcategory: string) => {
    setSelectedCategory(categoryId)
    // Agar "Barchasi" tanlangan bo'lsa (subcategory bo'sh string), faqat kategoriya filtri qo'llanadi
    setSelectedSubcategory(subcategory || undefined)
    setPage(1)
  }

  const getProductBadge = (product: Product): 'TOP' | 'PREMIUM' | 'YANGI' | 'MASHHUR' | undefined => {
    // Mock logic - can be based on product data
    if (product.id % 4 === 0) return 'TOP'
    if (product.id % 4 === 1) return 'PREMIUM'
    if (product.id % 4 === 2) return 'YANGI'
    if (product.id % 4 === 3) return 'MASHHUR'
    return undefined
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar Categories */}
          <CategoriesSidebar
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
          />

          {/* Products Grid */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Barcha loyihalar</h2>
              <span className="text-slate-600">{products.length} ta loyiha</span>
            </div>

            {loading ? (
              <Loading text="Mahsulotlar yuklanmoqda..." />
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="mb-4">Mahsulotlar topilmadi</p>
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory(undefined)
                  }}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Filtrni tozalash
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badge={getProductBadge(product)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-slate-50"
                    >
                      Oldingi
                    </button>
                    <span className="px-4 py-2">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-slate-50"
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




