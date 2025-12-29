import api from './api'
import { Product, User } from '@/types'

export interface Stats {
  total_users: number
  total_sellers: number
  total_products: number
  total_orders: number
}

export type { User }

export const adminService = {
  async getStats(): Promise<Stats> {
    const response = await api.get('/admin/stats')
    return response.data
  },

  async getPendingProducts(): Promise<Product[]> {
    const response = await api.get('/admin/products/pending')
    return response.data
  },

  async moderateProduct(productId: number, status: 'approved' | 'rejected'): Promise<Product> {
    const response = await api.post(`/admin/products/${productId}/moderate`, { status })
    return response.data
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/admin/users')
    return response.data
  },

  async getAllOrders(): Promise<any[]> {
    const response = await api.get('/admin/orders')
    return response.data
  },
}


