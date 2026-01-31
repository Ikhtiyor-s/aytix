'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productsService, Product } from '@/services/products'
import { ordersService } from '@/services/orders'
import { useAuth } from '@/hooks/useAuth'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  const loadProduct = async () => {
    try {
      const data = await productsService.getProduct(Number(params.id))
      setProduct(data)
    } catch (error) {
      setError('Product not found')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!product) return

    setOrderLoading(true)
    setError('')

    try {
      await ordersService.createOrder({
        items: [
          {
            product_id: product.id,
            quantity: quantity,
          },
        ],
      })
      router.push('/orders')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create order')
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center">Loading...</div>
  }

  if (error || !product) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-500">{error || 'Product not found'}</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          {product.category && (
            <p className="text-sm text-gray-500 mb-4">Category: {product.category.name}</p>
          )}

          <div className="mb-6">
            <span className="text-4xl font-bold text-indigo-600">${product.price}</span>
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Stock: <span className="font-semibold">{product.stock} available</span>
            </p>
            <p className="text-sm text-gray-600">
              Seller: <span className="font-semibold">{product.seller?.username || 'Unknown'}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {product.stock > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-medium">
                  Quantity:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={orderLoading || !isAuthenticated}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
              >
                {orderLoading ? 'Processing...' : isAuthenticated ? 'Add to Cart' : 'Login to Purchase'}
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded">
              Out of stock
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



