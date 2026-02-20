/**
 * Admin API Service - Kategoriyalar va Loyihalar uchun API.
 *
 * Bu modul admin backenddan ma'lumotlarni olish uchun ishlatiladi:
 * - Kategoriyalar va subkategoriyalar
 * - Loyihalar (filtrlash, qidirish)
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
// TYPES - Kategoriyalar
// =============================================================================

export interface CategoryProject {
  id: number
  name_uz: string
  name_ru: string | null
  name_en: string | null
  description_uz: string | null
  description_ru: string | null
  description_en: string | null
  icon: string | null
  order: number
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface SubcategoryProject {
  id: number
  name_uz: string
  name_ru: string | null
  name_en: string | null
  category_id: number
  order: number
  is_active: boolean
  created_at: string
  updated_at: string | null
}

// =============================================================================
// TYPES - Loyihalar
// =============================================================================

export interface Project {
  id: number
  name_uz: string
  name_ru: string | null
  name_en: string | null
  description_uz: string
  description_ru: string | null
  description_en: string | null
  category: string
  subcategory: string | null
  technologies: string[] | null
  features: string[] | null
  integrations: string[] | null
  color: string
  image_url: string | null
  images: string[] | null
  video_url: string | null
  views: number
  favorites: number
  status: 'active' | 'inactive'
  is_top: boolean
  is_new: boolean
  is_verified: boolean
  created_at: string
  updated_at: string | null
}

export interface ProjectsParams {
  skip?: number
  limit?: number
  category?: string
  subcategory?: string
  status?: string
  is_top?: boolean
  is_new?: boolean
  search?: string
}

export interface ProjectCounts {
  categories: Record<string, number>
  subcategories: Record<string, number>
}

// =============================================================================
// KATEGORIYALAR SERVISI
// =============================================================================

export const categoryProjectsService = {
  /**
   * Barcha kategoriyalarni olish.
   * @param isActive - Faqat faol kategoriyalar (ixtiyoriy)
   */
  async getCategories(isActive?: boolean): Promise<CategoryProject[]> {
    const params = isActive !== undefined ? { is_active: isActive } : {}
    const { data } = await adminApi.get<CategoryProject[]>('/project-categories/', { params })
    return data
  },

  /**
   * Bitta kategoriyani olish.
   */
  async getCategory(id: number): Promise<CategoryProject> {
    const { data } = await adminApi.get<CategoryProject>(`/project-categories/${id}`)
    return data
  },

  /**
   * Kategoriyaning subkategoriyalarini olish.
   */
  async getSubcategories(categoryId: number, isActive?: boolean): Promise<SubcategoryProject[]> {
    const params = isActive !== undefined ? { is_active: isActive } : {}
    const { data } = await adminApi.get<SubcategoryProject[]>(
      `/project-categories/${categoryId}/subcategories`,
      { params }
    )
    return data
  }
}

// =============================================================================
// LOYIHALAR SERVISI
// =============================================================================

// =============================================================================
// TYPES - Bannerlar
// =============================================================================

export interface Banner {
  id: number
  title_uz: string
  title_ru: string | null
  title_en: string | null
  description_uz: string | null
  description_ru: string | null
  description_en: string | null
  image_url: string | null
  video_url: string | null
  link_url: string | null
  project_id: number | null
  order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string | null
}

// =============================================================================
// BANNERLAR SERVISI
// =============================================================================

export const bannersService = {
  /**
   * Faol bannerlarni olish (public, autentifikatsiya kerak emas).
   */
  async getBanners(): Promise<Banner[]> {
    const { data } = await adminApi.get<Banner[]>('/content/banners/public')
    return data
  },

  /**
   * Bitta bannerni olish.
   */
  async getBanner(id: number): Promise<Banner> {
    const { data } = await adminApi.get<Banner>(`/content/banners/${id}`)
    return data
  }
}

// =============================================================================
// LOYIHALAR SERVISI
// =============================================================================

export const projectsService = {
  /**
   * Loyihalar sonini kategoriya va subkategoriya bo'yicha olish.
   */
  async getCounts(): Promise<ProjectCounts> {
    const { data } = await adminApi.get<ProjectCounts>('/projects/counts')
    return data
  },

  /**
   * Loyihalar ro'yxatini olish.
   *
   * Filtrlash:
   * - category: Kategoriya nomi
   * - status: active/inactive
   * - is_top: TOP loyihalar
   * - is_new: Yangi loyihalar
   * - search: Qidirish
   */
  async getProjects(params?: ProjectsParams): Promise<Project[]> {
    const { data } = await adminApi.get<Project[]>('/projects/', { params })
    return data
  },

  /**
   * Bitta loyihani olish.
   */
  async getProject(id: number): Promise<Project> {
    const { data} = await adminApi.get<Project>(`/projects/${id}`)
    return data
  }
}

// =============================================================================
// TYPES - Hamkorlar
// =============================================================================

export interface Partner {
  id: number
  name: string
  logo_url: string | null
  website: string | null
  description_uz: string | null
  description_ru: string | null
  description_en: string | null
  partner_type: string | null
  order: number
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string | null
}

// =============================================================================
// HAMKORLAR SERVISI
// =============================================================================

export const partnersService = {
  /**
   * Faol hamkorlarni olish (public).
   */
  async getPartners(): Promise<Partner[]> {
    const { data } = await adminApi.get<Partner[]>('/partners/public')
    return data
  }
}

// =============================================================================
// TYPES - Xabarnomalar
// =============================================================================

export interface Notification {
  id: number
  title_uz: string
  title_ru: string | null
  title_en: string | null
  message_uz: string | null
  message_ru: string | null
  message_en: string | null
  icon: string | null
  target: 'all' | 'users' | 'sellers' | 'admins'
  scheduled_at: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string | null
}

// =============================================================================
// XABARNOMALAR SERVISI
// =============================================================================

export const notificationsService = {
  /**
   * Faol xabarnomalarni olish (public).
   */
  async getNotifications(): Promise<Notification[]> {
    const { data } = await adminApi.get<Notification[]>('/content/notifications/public')
    return data
  }
}

// =============================================================================
// TYPES - Xabarlar (Contact Form)
// =============================================================================

export interface MessageCreate {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface Message {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  reply: string | null
  replied_at: string | null
  created_at: string
  updated_at: string | null
}

// =============================================================================
// XABARLAR SERVISI
// =============================================================================

export const messagesService = {
  /**
   * Yangi xabar yuborish (contact form).
   */
  async sendMessage(data: MessageCreate): Promise<Message> {
    const response = await adminApi.post<Message>('/messages', data)
    return response.data
  }
}

// =============================================================================
// TYPES - FAQ (Ko'p so'raladigan savollar)
// =============================================================================

export interface FAQ {
  id: number
  question_uz: string
  question_ru: string | null
  question_en: string | null
  answer_uz: string
  answer_ru: string | null
  answer_en: string | null
  category: string | null
  order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string | null
}

// =============================================================================
// FAQ SERVISI
// =============================================================================

export interface FAQCreate {
  question_uz: string
  question_ru?: string
  question_en?: string
  answer_uz: string
  answer_ru?: string
  answer_en?: string
  category?: string
  order?: number
  status?: 'active' | 'inactive'
}

export interface FAQUpdate {
  question_uz?: string
  question_ru?: string
  question_en?: string
  answer_uz?: string
  answer_ru?: string
  answer_en?: string
  category?: string
  order?: number
  status?: 'active' | 'inactive'
}

export const faqService = {
  /**
   * Faol FAQ larni olish (public, autentifikatsiya kerak emas).
   */
  async getFAQs(category?: string): Promise<FAQ[]> {
    const params = category ? { category } : {}
    const { data } = await adminApi.get<FAQ[]>('/faq/public', { params })
    return data
  },

  /**
   * Barcha FAQ larni olish (admin).
   */
  async getAdminFAQs(token: string, category?: string, status?: string): Promise<FAQ[]> {
    const params: any = {}
    if (category) params.category = category
    if (status) params.status = status
    const { data } = await adminApi.get<FAQ[]>('/faq', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * Bitta FAQ ni olish (admin).
   */
  async getFAQ(token: string, id: number): Promise<FAQ> {
    const { data } = await adminApi.get<FAQ>(`/faq/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * Yangi FAQ yaratish (admin).
   */
  async createFAQ(token: string, faq: FAQCreate): Promise<FAQ> {
    const { data } = await adminApi.post<FAQ>('/faq', faq, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * FAQ ni yangilash (admin).
   */
  async updateFAQ(token: string, id: number, faq: FAQUpdate): Promise<FAQ> {
    const { data } = await adminApi.put<FAQ>(`/faq/${id}`, faq, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * FAQ ni o'chirish (admin).
   */
  async deleteFAQ(token: string, id: number): Promise<void> {
    await adminApi.delete(`/faq/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },

  /**
   * FAQ tartibini o'zgartirish (admin).
   */
  async reorderFAQs(token: string, items: { id: number; order: number }[]): Promise<void> {
    await adminApi.post('/faq/reorder', { items }, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },

  /**
   * FAQ holatini o'zgartirish (admin).
   */
  async toggleFAQStatus(token: string, id: number): Promise<FAQ> {
    const { data } = await adminApi.patch<FAQ>(`/faq/${id}/toggle`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  }
}

// =============================================================================
// TYPES - Footer
// =============================================================================

export interface FooterItem {
  id: number
  title_uz: string
  title_ru: string | null
  title_en: string | null
  url: string
  icon: string | null
  is_external: boolean
  order: number
  is_active: boolean
}

export interface FooterSection {
  id: number
  title_uz: string
  title_ru: string | null
  title_en: string | null
  slug: string
  order: number
  is_active: boolean
  items: FooterItem[]
}

export interface FooterSocialLink {
  id: number
  platform: string
  link_url: string
  icon: string | null
  order: number
  is_active: boolean
}

export interface FooterContact {
  id: number
  contact_type: string
  label_uz: string
  label_ru: string | null
  label_en: string | null
  value: string
  icon: string | null
  link_url: string | null
  order: number
  is_active: boolean
}

export interface FooterData {
  sections: FooterSection[]
  social_links: FooterSocialLink[]
  contacts: FooterContact[]
}

// =============================================================================
// FOOTER SERVISI
// =============================================================================

export const footerService = {
  /**
   * Footer ma'lumotlarini olish (public, autentifikatsiya kerak emas).
   */
  async getFooterData(): Promise<FooterData> {
    const { data } = await adminApi.get<FooterData>('/footer/public')
    return data
  }
}

export default adminApi

// =============================================================================
// TYPES - Site Contacts (Sayt aloqa ma'lumotlari)
// =============================================================================

export interface SiteContacts {
  id: number
  phone_primary: string
  phone_secondary: string | null
  telegram_username: string | null
  telegram_url: string | null
  whatsapp_number: string | null
  email_primary: string | null
  email_secondary: string | null
  address_uz: string | null
  address_ru: string | null
  address_en: string | null
  working_hours_uz: string | null
  working_hours_ru: string | null
  working_hours_en: string | null
  additional_info_uz: string | null
  additional_info_ru: string | null
  additional_info_en: string | null
  created_at: string
  updated_at: string | null
}

export interface SiteContactsUpdate {
  phone_primary?: string
  phone_secondary?: string
  telegram_username?: string
  telegram_url?: string
  whatsapp_number?: string
  email_primary?: string
  email_secondary?: string
  address_uz?: string
  address_ru?: string
  address_en?: string
  working_hours_uz?: string
  working_hours_ru?: string
  working_hours_en?: string
  additional_info_uz?: string
  additional_info_ru?: string
  additional_info_en?: string
}

// =============================================================================
// SITE CONTACTS SERVISI
// =============================================================================

export const siteContactsService = {
  /**
   * Public aloqa ma'lumotlarini olish.
   */
  async getPublicContacts(): Promise<SiteContacts> {
    const { data } = await adminApi.get<SiteContacts>('/site-contacts/public')
    return data
  },

  /**
   * Admin - aloqa ma'lumotlarini olish.
   */
  async getContacts(token: string): Promise<SiteContacts> {
    const { data } = await adminApi.get<SiteContacts>('/site-contacts', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * Admin - aloqa ma'lumotlarini yangilash.
   */
  async updateContacts(token: string, contacts: SiteContactsUpdate): Promise<SiteContacts> {
    const { data } = await adminApi.put<SiteContacts>('/site-contacts', contacts, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  }
}
