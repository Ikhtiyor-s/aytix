import api from './api'
import { Product, PaginatedResponse } from '@/types'

export interface ProductCreate {
  name: string
  description?: string
  price: number
  stock: number
  image_url?: string
  category_id?: number
}

export interface ProductUpdate {
  name?: string
  description?: string
  price?: number
  stock?: number
  image_url?: string
  category_id?: number
}

export type { Product, PaginatedResponse }

export const productsService = {
  async getProducts(page = 1, pageSize = 20, categoryId?: number, search?: string): Promise<PaginatedResponse<Product>> {
    const params: any = { page, page_size: pageSize }
    if (categoryId) params.category_id = categoryId
    if (search) params.search = search
    const response = await api.get('/products', { params })
    return response.data
  },

  async getProduct(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  async getMyProducts(): Promise<Product[]> {
    const response = await api.get('/products/my-products')
    return response.data
  },

  async createProduct(data: ProductCreate): Promise<Product> {
    const response = await api.post('/products', data)
    return response.data
  },

  async updateProduct(id: number, data: ProductUpdate): Promise<Product> {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`)
  },
}


