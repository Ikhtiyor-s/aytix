import { adminApiInstance } from './adminApi'
import type { FooterData } from './adminApi.types'

// =============================================================================
// FOOTER SERVISI
// =============================================================================

export const footerService = {
  /**
   * Footer ma'lumotlarini olish (public, autentifikatsiya kerak emas).
   */
  async getFooterData(): Promise<FooterData> {
    const { data } = await adminApiInstance.get<FooterData>('/footer/public')
    return data
  }
}
