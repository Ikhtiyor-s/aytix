'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { FooterContact, adminApi } from '@/services/adminApi'

interface ContactFormData {
  contact_type: string
  value: string
  label_uz?: string
  label_ru?: string
  label_en?: string
  link_url?: string
  icon?: string
  order: number
  is_active: boolean
}

export default function ContactsAdminPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState<FooterContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<FooterContact | null>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    contact_type: 'phone',
    value: '',
    label_uz: '',
    label_ru: '',
    label_en: '',
    link_url: '',
    icon: '',
    order: 0,
    is_active: true,
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
    loadContacts()
  }, [isAuthenticated, user])

  const loadContacts = async () => {
    try {
      const { data } = await adminApi.get<FooterContact[]>('/footer/contacts/')
      setContacts(data)
    } catch (error) {
      console.error('Kontaktlarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (contact?: FooterContact) => {
    if (contact) {
      setEditingContact(contact)
      setFormData({
        contact_type: contact.contact_type,
        value: contact.value,
        label_uz: contact.label_uz || '',
        label_ru: contact.label_ru || '',
        label_en: contact.label_en || '',
        link_url: contact.link_url || '',
        icon: contact.icon || '',
        order: contact.order,
        is_active: contact.is_active,
      })
    } else {
      setEditingContact(null)
      setFormData({
        contact_type: 'phone',
        value: '',
        label_uz: '',
        label_ru: '',
        label_en: '',
        link_url: '',
        icon: '',
        order: contacts.length,
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingContact(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingContact) {
        // Yangilash
        await adminApi.put(`/footer/contacts/${editingContact.id}/`, formData)
      } else {
        // Yangi yaratish
        await adminApi.post('/footer/contacts/', formData)
      }
      loadContacts()
      handleCloseModal()
    } catch (error) {
      console.error('Saqlashda xatolik:', error)
      alert('Saqlashda xatolik yuz berdi')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return
    try {
      await adminApi.delete(`/footer/contacts/${id}/`)
      loadContacts()
    } catch (error) {
      console.error('O\'chirishda xatolik:', error)
      alert('O\'chirishda xatolik yuz berdi')
    }
  }

  const getContactTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      phone: 'Telefon',
      email: 'Email',
      telegram: 'Telegram',
      whatsapp: 'WhatsApp',
      address: 'Manzil',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kontaktlar Boshqaruvi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Yangi Kontakt
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Turi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Qiymat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Label (UZ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tartib
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Holat
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {contact.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {getContactTypeLabel(contact.contact_type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {contact.value}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {contact.label_uz || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {contact.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      contact.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {contact.is_active ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(contact)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400"
                  >
                    O'chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingContact ? 'Kontaktni Tahrirlash' : 'Yangi Kontakt Qo\'shish'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Contact Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kontakt Turi *
                    </label>
                    <select
                      value={formData.contact_type}
                      onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                      required
                    >
                      <option value="phone">Telefon</option>
                      <option value="email">Email</option>
                      <option value="telegram">Telegram</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="address">Manzil</option>
                    </select>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Qiymat * {formData.contact_type === 'telegram' && '(@username)'}
                    </label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                      placeholder={
                        formData.contact_type === 'phone'
                          ? '+998 XX XXX XX XX'
                          : formData.contact_type === 'telegram'
                          ? '@username'
                          : ''
                      }
                      required
                    />
                  </div>

                  {/* Labels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Label (O'zbekcha)
                      </label>
                      <input
                        type="text"
                        value={formData.label_uz}
                        onChange={(e) => setFormData({ ...formData, label_uz: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Label (Русский)
                      </label>
                      <input
                        type="text"
                        value={formData.label_ru}
                        onChange={(e) => setFormData({ ...formData, label_ru: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Label (English)
                      </label>
                      <input
                        type="text"
                        value={formData.label_en}
                        onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Link URL (optional - auto-generated if empty) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Link URL (ixtiyoriy - avtomatik yaratiladi)
                    </label>
                    <input
                      type="text"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                      placeholder="tel:, mailto:, https://"
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tartib
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                      Faol
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
