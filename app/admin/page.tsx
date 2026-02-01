'use client'

import { useState, useEffect } from 'react'
import { adminService, Stats } from '@/services/admin'
import { Product } from '@/services/products'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function AdminPanelPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingProducts, setPendingProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'users' | 'orders'>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user && user.role !== 'admin') {
      router.push('/marketplace')
      return
    }
    loadData()
  }, [isAuthenticated, user, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'dashboard') {
        const statsData = await adminService.getStats()
        setStats(statsData)
      } else if (activeTab === 'products') {
        const productsData = await adminService.getPendingProducts()
        setPendingProducts(productsData)
      }
    } catch (error) {
      console.error('Failed to load data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = async (productId: number, status: 'approved' | 'rejected') => {
    try {
      await adminService.moderateProduct(productId, status)
      loadData()
    } catch (error) {
      console.error('Failed to moderate product', error)
      alert('Failed to moderate product')
    }
  }

  if (loading && activeTab === 'dashboard') {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Panel</h1>

      {/* Quick Links */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          href="/admin/faq"
          className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">FAQ Boshqaruvi</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Savol-javoblarni tahrirlash</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/site-contacts"
          className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Aloqa Ma'lumotlari</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Telefon, telegram, emaillarni boshqarish</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/contacts"
          className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Footer Kontaktlar</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Footer ijtimoiy tarmoqlar</p>
            </div>
          </div>
        </a>
      </div>

      <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          {(['dashboard', 'products', 'users', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sellers</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_sellers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_products}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_orders}</p>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pending Products</h2>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : pendingProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No pending products</div>
          ) : (
            <div className="space-y-4">
              {pendingProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-2 whitespace-pre-line leading-relaxed">{product.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Price: ${product.price}</span>
                        <span>Stock: {product.stock}</span>
                        <span>Seller: {product.seller?.username || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleModerate(product.id, 'approved')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerate(product.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Users</h2>
          <div className="text-center py-12 text-gray-500">
            User list feature - implement as needed
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Orders</h2>
          <div className="text-center py-12 text-gray-500">
            Order list feature - implement as needed
          </div>
        </div>
      )}
    </div>
  )
}



