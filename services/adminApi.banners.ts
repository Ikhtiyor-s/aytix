import { adminApiInstance } from './adminApi'
import type { Banner } from './adminApi.types'

// =============================================================================
// BANNERLAR SERVISI
// =============================================================================

export const bannersService = {
  /**
   * Faol bannerlarni olish (public, autentifikatsiya kerak emas).
   */
  async getBanners(): Promise<Banner[]> {
    const { data } = await adminApiInstance.get<Banner[]>('/content/banners/public')
    return data
  },

  /**
   * Bitta bannerni olish.
   */
  async getBanner(id: number): Promise<Banner> {
    const { data } = await adminApiInstance.get<Banner>(`/content/banners/${id}`)
    return data
  }
}
