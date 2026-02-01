'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import adminApi, { FAQ, FAQCreate, FAQUpdate, faqService } from '@/services/adminApi'
import Loading from '@/components/ui/Loading'

export default function AdminFAQPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState<FAQCreate>({
    question_uz: '',
    question_ru: '',
    question_en: '',
    answer_uz: '',
    answer_ru: '',
    answer_en: '',
    category: '',
    order: 0,
    status: 'active'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin-login')
      return
    }
    if (user && user.role !== 'admin') {
      router.push('/marketplace')
      return
    }
    loadFAQs()
  }, [isAuthenticated, user, filterCategory, filterStatus])

  const loadFAQs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/admin-login')
        return
      }
      const data = await faqService.getAdminFAQs(token, filterCategory || undefined, filterStatus || undefined)
      setFaqs(data)
    } catch (error) {
      console.error('Failed to load FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq)
      setFormData({
        question_uz: faq.question_uz,
        question_ru: faq.question_ru || '',
        question_en: faq.question_en || '',
        answer_uz: faq.answer_uz,
        answer_ru: faq.answer_ru || '',
        answer_en: faq.answer_en || '',
        category: faq.category || '',
        order: faq.order,
        status: faq.status
      })
    } else {
      setEditingFaq(null)
      setFormData({
        question_uz: '',
        question_ru: '',
        question_en: '',
        answer_uz: '',
        answer_ru: '',
        answer_en: '',
        category: '',
        order: 0,
        status: 'active'
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingFaq(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      if (editingFaq) {
        await faqService.updateFAQ(token, editingFaq.id, formData)
      } else {
        await faqService.createFAQ(token, formData)
      }

      handleCloseModal()
      loadFAQs()
    } catch (error) {
      console.error('Failed to save FAQ:', error)
      alert('Xatolik yuz berdi!')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      await faqService.deleteFAQ(token, id)
      setDeleteConfirm(null)
      loadFAQs()
    } catch (error) {
      console.error('Failed to delete FAQ:', error)
      alert('Xatolik yuz berdi!')
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      await faqService.toggleFAQStatus(token, id)
      loadFAQs()
    } catch (error) {
      console.error('Failed to toggle status:', error)
      alert('Xatolik yuz berdi!')
    }
  }

  // Kategoriyalarni olish
  const categories = Array.from(new Set(faqs.map(f => f.category).filter(Boolean))) as string[]

  if (loading) {
    return <Loading text="Yuklanmoqda..." />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            FAQ Boshqaruvi
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Ko'p so'raladigan savollarni boshqarish
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Barcha holatlar</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            + Yangi FAQ
          </button>
        </div>

        {/* FAQ Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">
                    Savol (UZ)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">
                    Kategoriya
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">
                    Tartib
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">
                    Holat
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {faq.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white max-w-md truncate">
                        {faq.question_uz}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {faq.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                          {faq.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {faq.order}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStatus(faq.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          faq.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {faq.status === 'active' ? 'Faol' : 'Nofaol'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right text-sm">
                      <button
                        onClick={() => handleOpenModal(faq)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(faq.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {faqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">FAQ lar topilmadi</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingFaq ? 'FAQ tahrirlash' : 'Yangi FAQ qo\'shish'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Uzbek */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  O'zbek tili
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Savol (UZ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.question_uz}
                    onChange={(e) => setFormData({ ...formData, question_uz: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Savol matnini kiriting..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Javob (UZ) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.answer_uz}
                    onChange={(e) => setFormData({ ...formData, answer_uz: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Javob matnini kiriting..."
                  />
                </div>
              </div>

              {/* Russian */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Русский язык
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Вопрос (RU)
                  </label>
                  <input
                    type="text"
                    value={formData.question_ru}
                    onChange={(e) => setFormData({ ...formData, question_ru: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Введите текст вопроса..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ответ (RU)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.answer_ru}
                    onChange={(e) => setFormData({ ...formData, answer_ru: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Введите текст ответа..."
                  />
                </div>
              </div>

              {/* English */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  English
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Question (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.question_en}
                    onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Enter question text..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Answer (EN)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.answer_en}
                    onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Enter answer text..."
                  />
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategoriya
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Umumiy, Xarid..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tartib
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Holat
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingFaq ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              FAQ ni o'chirish
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Ushbu FAQ ni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
