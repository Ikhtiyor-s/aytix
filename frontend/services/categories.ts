import api from './api'
import { Category } from '@/types'

export type { Category }

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories')
    return response.data
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },
}


