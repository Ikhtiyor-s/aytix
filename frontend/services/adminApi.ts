import axios from 'axios'

// API URL - marketplace backend (project-kategoriyalar va loyihalar)
const ADMIN_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Category types
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

// Project types
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
  views: number
  favorites: number
  status: 'active' | 'inactive'
  is_top: boolean
  is_new: boolean
  created_at: string
  updated_at: string | null
}

// Category services
export const categoryProjectsService = {
  getCategories: async (isActive?: boolean): Promise<CategoryProject[]> => {
    const params = isActive !== undefined ? { is_active: isActive } : {}
    const response = await adminApi.get('/project-categories/', { params })
    return response.data
  },

  getCategory: async (id: number): Promise<CategoryProject> => {
    const response = await adminApi.get(`/project-categories/${id}`)
    return response.data
  },

  getSubcategories: async (categoryId: number, isActive?: boolean): Promise<SubcategoryProject[]> => {
    const params = isActive !== undefined ? { is_active: isActive } : {}
    const response = await adminApi.get(`/project-categories/${categoryId}/subcategories`, { params })
    return response.data
  },
}

// Project services
export const projectsService = {
  getProjects: async (params?: {
    skip?: number
    limit?: number
    category?: string
    status?: string
    is_top?: boolean
    is_new?: boolean
    search?: string
  }): Promise<Project[]> => {
    const response = await adminApi.get('/projects/', { params })
    return response.data
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await adminApi.get(`/projects/${id}`)
    return response.data
  },
}

export default adminApi
