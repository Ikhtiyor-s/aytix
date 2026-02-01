'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SiteContacts, SiteContactsUpdate, siteContactsService } from '@/services/adminApi'
import Loading from '@/components/ui/Loading'

export default function AdminSiteContactsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [contacts, setContacts] = useState<SiteContacts | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<SiteContactsUpdate>({
    phone_primary: '',
    phone_secondary: '',
    telegram_username: '',
    telegram_url: '',
    whatsapp_number: '',
    email_primary: '',
    email_secondary: '',
    address_uz: '',
    address_ru: '',
    address_en: '',
    working_hours_uz: '',
    working_hours_ru: '',
    working_hours_en: '',
    additional_info_uz: '',
    additional_info_ru: '',
    additional_info_en: ''
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
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/admin-login')
        return
      }
      const data = await siteContactsService.getContacts(token)
      setContacts(data)
      setFormData({
        phone_primary: data.phone_primary,
        phone_secondary: data.phone_secondary || '',
        telegram_username: data.telegram_username || '',
        telegram_url: data.telegram_url || '',
        whatsapp_number: data.whatsapp_number || '',
        email_primary: data.email_primary || '',
        email_secondary: data.email_secondary || '',
        address_uz: data.address_uz || '',
        address_ru: data.address_ru || '',
        address_en: data.address_en || '',
        working_hours_uz: data.working_hours_uz || '',
        working_hours_ru: data.working_hours_ru || '',
        working_hours_en: data.working_hours_en || '',
        additional_info_uz: data.additional_info_uz || '',
        additional_info_ru: data.additional_info_ru || '',
        additional_info_en: data.additional_info_en || ''
      })
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      await siteContactsService.updateContacts(token, formData)
      alert('Ma\'lumotlar saqlandi!')
      loadContacts()
    } catch (error) {
      console.error('Failed to save contacts:', error)
      alert('Xatolik yuz berdi!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading text="Yuklanmoqda..." />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Aloqa Ma'lumotlari
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sayt aloqa ma'lumotlarini boshqarish
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Telefon raqamlar */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Telefon Raqamlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Asosiy telefon *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone_primary}
                  onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="+998 90 123 45 67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Qo'shimcha telefon
                </label>
                <input
                  type="text"
                  value={formData.phone_secondary}
                  onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="+998 90 123 45 68"
                />
              </div>
            </div>
          </div>

          {/* Messenger */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Ijtimoiy Tarmoqlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Telegram username
                </label>
                <input
                  type="text"
                  value={formData.telegram_username}
                  onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="@aytixuz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Telegram URL
                </label>
                <input
                  type="text"
                  value={formData.telegram_url}
                  onChange={(e) => setFormData({ ...formData, telegram_url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="https://t.me/aytixuz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  WhatsApp raqam
                </label>
                <input
                  type="text"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="+998901234567"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Email Manzillar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Asosiy email
                </label>
                <input
                  type="email"
                  value={formData.email_primary}
                  onChange={(e) => setFormData({ ...formData, email_primary: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="info@aytix.uz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Qo'shimcha email
                </label>
                <input
                  type="email"
                  value={formData.email_secondary}
                  onChange={(e) => setFormData({ ...formData, email_secondary: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="support@aytix.uz"
                />
              </div>
            </div>
          </div>

          {/* Manzil */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Manzil
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Manzil (UZ)
                </label>
                <textarea
                  rows={2}
                  value={formData.address_uz}
                  onChange={(e) => setFormData({ ...formData, address_uz: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Toshkent shahri, Amir Temur ko'chasi 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Адрес (RU)
                </label>
                <textarea
                  rows={2}
                  value={formData.address_ru}
                  onChange={(e) => setFormData({ ...formData, address_ru: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="г. Ташкент, ул. Амира Темура 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Address (EN)
                </label>
                <textarea
                  rows={2}
                  value={formData.address_en}
                  onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Tashkent city, Amir Temur street 1"
                />
              </div>
            </div>
          </div>

          {/* Ish vaqti */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Ish Vaqti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ish vaqti (UZ)
                </label>
                <input
                  type="text"
                  value={formData.working_hours_uz}
                  onChange={(e) => setFormData({ ...formData, working_hours_uz: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Dush-Juma: 9:00-18:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Рабочие часы (RU)
                </label>
                <input
                  type="text"
                  value={formData.working_hours_ru}
                  onChange={(e) => setFormData({ ...formData, working_hours_ru: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Пн-Пт: 9:00-18:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Working hours (EN)
                </label>
                <input
                  type="text"
                  value={formData.working_hours_en}
                  onChange={(e) => setFormData({ ...formData, working_hours_en: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Mon-Fri: 9:00-18:00"
                />
              </div>
            </div>
          </div>

          {/* Saqlash tugmasi */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
