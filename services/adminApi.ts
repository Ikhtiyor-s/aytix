/**
 * Admin API Service - Barrel file.
 *
 * Bu modul admin backenddan ma'lumotlarni olish uchun ishlatiladi.
 * Barcha servislar va tiplar shu yerdan re-export qilinadi,
 * shuning uchun mavjud importlar o'zgarmaydi.
 */

import axios, { AxiosInstance } from 'axios'

// =============================================================================
// KONFIGURATSIYA
// =============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'
// BACKEND_URL ni API_URL dan olamiz (/api/v1 ni olib tashlab)
const BACKEND_URL = API_URL.startsWith('/') ? '' : API_URL.replace('/api/v1', '')

const adminApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

/** Axios instance — split fayllar shu orqali API ga murojaat qiladi. */
export const adminApiInstance = adminApi

/**
 * Rasm URL-ni to'liq formatga o'zgartirish.
 * /uploads/... -> https://api.aytix.uz/uploads/...
 */
export const getImageUrl = (url: string | null): string | null => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}

// =============================================================================
// RE-EXPORTS — backward compatibility uchun
// =============================================================================

export * from './adminApi.types'
export { categoryProjectsService } from './adminApi.categories'
export { projectsService } from './adminApi.projects'
export { bannersService } from './adminApi.banners'
export { faqService } from './adminApi.faq'
export { footerService } from './adminApi.footer'
export {
  partnersService,
  notificationsService,
  messagesService,
  siteContactsService
} from './adminApi.misc'

export default adminApi
