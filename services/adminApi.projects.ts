import { adminApiInstance } from './adminApi'
import type { Project, ProjectsParams, ProjectCounts } from './adminApi.types'

// =============================================================================
// LOYIHALAR SERVISI
// =============================================================================

export const projectsService = {
  /**
   * Loyihalar sonini kategoriya va subkategoriya bo'yicha olish.
   */
  async getCounts(): Promise<ProjectCounts> {
    const { data } = await adminApiInstance.get<ProjectCounts>('/projects/counts')
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
    const { data } = await adminApiInstance.get<Project[]>('/projects/', { params })
    return data
  },

  /**
   * Bitta loyihani olish.
   */
  async getProject(id: number): Promise<Project> {
    const { data} = await adminApiInstance.get<Project>(`/projects/${id}`)
    return data
  }
}
