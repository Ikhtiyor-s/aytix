'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Project, getImageUrl } from '@/services/adminApi'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const getBadge = () => {
    if (project.is_top) return { text: 'TOP', color: 'bg-yellow-400 text-slate-900' }
    if (project.is_new) return { text: 'YANGI', color: 'bg-green-500 text-white' }
    return null
  }

  const badge = getBadge()

  return (
    <Link
      href={`/projects/${project.id}`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        {project.image_url ? (
          <img
            src={getImageUrl(project.image_url) || ''}
            alt={project.name_uz}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${project.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center`}>
            <span className="text-6xl text-white/80">
              {project.category === 'Biznes va Avtomatlashtirish' && '💼'}
              {project.category === 'Savdo va Marketing' && '📈'}
              {project.category === 'AI va Avtomatik Yordamchilar' && '🤖'}
              {project.category === 'Mobil va Veb Ilovalar' && '📱'}
              {project.category === "Ta'lim va O'rganish" && '📚'}
              {!['Biznes va Avtomatlashtirish', 'Savdo va Marketing', 'AI va Avtomatik Yordamchilar', 'Mobil va Veb Ilovalar', "Ta'lim va O'rganish"].includes(project.category) && '🚀'}
            </span>
          </div>
        )}
        {badge && (
          <span className={`absolute top-4 left-4 px-3 py-1 ${badge.color} text-xs font-bold rounded-full`}>
            {badge.text}
          </span>
        )}
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{project.name_uz}</h3>
        {project.description_uz && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description_uz}</p>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-indigo-600 font-medium">{project.category}</span>
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {project.views}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {project.favorites}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
