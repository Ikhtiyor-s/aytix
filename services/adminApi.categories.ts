import { adminApiInstance } from './adminApi'
import type { CategoryProject, SubcategoryProject } from './adminApi.types'

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
    const { data } = await adminApiInstance.get<CategoryProject[]>('/project-categories/', { params })
    return data
  },

  /**
   * Bitta kategoriyani olish.
   */
  async getCategory(id: number): Promise<CategoryProject> {
    const { data } = await adminApiInstance.get<CategoryProject>(`/project-categories/${id}`)
    return data
  },

  /**
   * Kategoriyaning subkategoriyalarini olish.
   */
  async getSubcategories(categoryId: number, isActive?: boolean): Promise<SubcategoryProject[]> {
    const params = isActive !== undefined ? { is_active: isActive } : {}
    const { data } = await adminApiInstance.get<SubcategoryProject[]>(
      `/project-categories/${categoryId}/subcategories`,
      { params }
    )
    return data
  }
}
