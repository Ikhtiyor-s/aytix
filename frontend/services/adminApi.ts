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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const adminApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

/**
 * Rasm URL-ni to'liq formatga o'zgartirish.
 * /uploads/... -> http://localhost:8000/uploads/...
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
  created_at: string
  updated_at: string | null
}

export interface ProjectsParams {
  skip?: number
  limit?: number
  category?: string
  status?: string
  is_top?: boolean
  is_new?: boolean
  search?: string
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
    const { data } = await adminApi.get<Project>(`/projects/${id}`)
    return data
  }
}

export default adminApi
