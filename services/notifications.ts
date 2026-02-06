import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.aytix.uz/api/v1'

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

// Frontend uchun formatlangan notification
export interface FormattedNotification {
  id: number
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
  time: string
  read: boolean
}

// Vaqtni formatlash
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Hozirgina"
  if (diffMins < 60) return `${diffMins} daqiqa oldin`
  if (diffHours < 24) return `${diffHours} soat oldin`
  if (diffDays < 7) return `${diffDays} kun oldin`
  return date.toLocaleDateString('uz-UZ')
}

// Icon asosida type aniqlash
function getNotificationType(icon: string | null): 'success' | 'info' | 'warning' {
  if (!icon) return 'info'
  if (icon.includes('success') || icon.includes('check') || icon === '✓') return 'success'
  if (icon.includes('warning') || icon.includes('alert') || icon === '⚠') return 'warning'
  return 'info'
}

export const notificationsService = {
  /**
   * Barcha faol bildirishnomalarni olish (public).
   */
  async getNotifications(): Promise<FormattedNotification[]> {
    try {
      // Public endpoint - admin yaratgan barcha faol xabarnomalar (token yubormasdan)
      const response = await axios.get(`${API_URL}/content/notifications/public`)
      const notifications: Notification[] = response.data

      // LocalStorage dan o'qilgan xabarnomalarni olish
      const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]')

      return notifications.map(notif => ({
        id: notif.id,
        type: getNotificationType(notif.icon),
        title: notif.title_uz,
        message: notif.message_uz || '',
        time: formatTime(notif.created_at),
        read: readIds.includes(notif.id)
      }))
    } catch (error) {
      console.error('Failed to load notifications', error)
      return []
    }
  },

  /**
   * Bildirishnomani o'qilgan deb belgilash (localStorage da).
   */
  markAsRead(notificationId: number): void {
    const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]')
    if (!readIds.includes(notificationId)) {
      readIds.push(notificationId)
      localStorage.setItem('readNotifications', JSON.stringify(readIds))
    }
  },

  /**
   * Barcha bildirishnomalarni o'qilgan deb belgilash.
   */
  markAllAsRead(notificationIds: number[]): void {
    localStorage.setItem('readNotifications', JSON.stringify(notificationIds))
  },

  /**
   * O'qilmagan bildirishnomalar sonini olish.
   */
  getUnreadCount(notifications: FormattedNotification[]): number {
    return notifications.filter(n => !n.read).length
  }
}
