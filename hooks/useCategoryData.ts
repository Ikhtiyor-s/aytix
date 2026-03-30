'use client'

import { useState, useEffect } from 'react'
import { categoryProjectsService, CategoryProject, SubcategoryProject, projectsService, ProjectCounts } from '@/services/adminApi'

export interface CategoryWithSubs extends CategoryProject {
  subcategories: SubcategoryProject[]
}

export function useCategoryData(selectedCategory?: string) {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [projectCounts, setProjectCounts] = useState<ProjectCounts>({ categories: {}, subcategories: {} })

  useEffect(() => {
    loadCategories()
    loadProjectCounts()
  }, [])

  // URL parametrlari bilan kelganda kategoriyani avtomatik ochish
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const matchingCat = categories.find(c => c.name_uz === selectedCategory)
      if (matchingCat) {
        setExpandedCategory(matchingCat.id)
      }
    }
  }, [selectedCategory, categories])

  const loadCategories = async () => {
    try {
      const cats = await categoryProjectsService.getCategories(true)
      const catsWithSubs = await Promise.all(
        cats.map(async (cat) => {
          try {
            const subs = await categoryProjectsService.getSubcategories(cat.id, true)
            return { ...cat, subcategories: subs }
          } catch {
            return { ...cat, subcategories: [] }
          }
        })
      )
      setCategories(catsWithSubs)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProjectCounts = async () => {
    try {
      const counts = await projectsService.getCounts()
      setProjectCounts(counts)
    } catch (error) {
      console.error('Failed to load project counts:', error)
    }
  }

  const getCategoryCount = (categoryName: string): number => {
    return projectCounts.categories[categoryName] || 0
  }

  const getSubcategoryCount = (categoryName: string, subcategoryName: string): number => {
    const key = categoryName + ':' + subcategoryName
    return projectCounts.subcategories[key] || 0
  }

  return {
    categories,
    loading,
    expandedCategory,
    setExpandedCategory,
    projectCounts,
    getCategoryCount,
    getSubcategoryCount,
  }
}
