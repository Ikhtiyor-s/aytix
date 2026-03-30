import { adminApiInstance } from './adminApi'
import type { FAQ, FAQCreate, FAQUpdate } from './adminApi.types'

// =============================================================================
// FAQ SERVISI
// =============================================================================

export const faqService = {
  /**
   * Faol FAQ larni olish (public, autentifikatsiya kerak emas).
   */
  async getFAQs(category?: string): Promise<FAQ[]> {
    const params = category ? { category } : {}
    const { data } = await adminApiInstance.get<FAQ[]>('/faq/public', { params })
    return data
  },

  /**
   * Barcha FAQ larni olish (admin).
   */
  async getAdminFAQs(token: string, category?: string, status?: string): Promise<FAQ[]> {
    const params: any = {}
    if (category) params.category = category
    if (status) params.status = status
    const { data } = await adminApiInstance.get<FAQ[]>('/faq', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * Bitta FAQ ni olish (admin).
   */
  async getFAQ(token: string, id: number): Promise<FAQ> {
    const { data } = await adminApiInstance.get<FAQ>(`/faq/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * Yangi FAQ yaratish (admin).
   */
  async createFAQ(token: string, faq: FAQCreate): Promise<FAQ> {
    const { data } = await adminApiInstance.post<FAQ>('/faq', faq, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * FAQ ni yangilash (admin).
   */
  async updateFAQ(token: string, id: number, faq: FAQUpdate): Promise<FAQ> {
    const { data } = await adminApiInstance.put<FAQ>(`/faq/${id}`, faq, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * FAQ ni o'chirish (admin).
   */
  async deleteFAQ(token: string, id: number): Promise<void> {
    await adminApiInstance.delete(`/faq/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },

  /**
   * FAQ tartibini o'zgartirish (admin).
   */
  async reorderFAQs(token: string, items: { id: number; order: number }[]): Promise<void> {
    await adminApiInstance.post('/faq/reorder', { items }, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },

  /**
   * FAQ holatini o'zgartirish (admin).
   */
  async toggleFAQStatus(token: string, id: number): Promise<FAQ> {
    const { data } = await adminApiInstance.patch<FAQ>(`/faq/${id}/toggle`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  }
}
