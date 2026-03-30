import { adminApiInstance } from './adminApi'
import type {
  Partner,
  Notification,
  MessageCreate,
  Message,
  SiteContacts,
  SiteContactsUpdate
} from './adminApi.types'

// =============================================================================
// HAMKORLAR SERVISI
// =============================================================================

export const partnersService = {
  /**
   * Faol hamkorlarni olish (public).
   */
  async getPartners(): Promise<Partner[]> {
    const { data } = await adminApiInstance.get<Partner[]>('/partners/public')
    return data
  }
}

// =============================================================================
// XABARNOMALAR SERVISI
// =============================================================================

export const notificationsService = {
  /**
   * Faol xabarnomalarni olish (public).
   */
  async getNotifications(): Promise<Notification[]> {
    const { data } = await adminApiInstance.get<Notification[]>('/content/notifications/public')
    return data
  }
}

// =============================================================================
// XABARLAR SERVISI
// =============================================================================

export const messagesService = {
  /**
   * Yangi xabar yuborish (contact form).
   */
  async sendMessage(data: MessageCreate): Promise<Message> {
    const response = await adminApiInstance.post<Message>('/messages', data)
    return response.data
  }
}

// =============================================================================
// SITE CONTACTS SERVISI
// =============================================================================

export const siteContactsService = {
  /**
   * Public aloqa ma'lumotlarini olish.
   */
  async getPublicContacts(): Promise<SiteContacts> {
    const { data } = await adminApiInstance.get<SiteContacts>('/site-contacts/public')
    return data
  },

  /**
   * Admin - aloqa ma'lumotlarini olish.
   */
  async getContacts(token: string): Promise<SiteContacts> {
    const { data } = await adminApiInstance.get<SiteContacts>('/site-contacts', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  /**
   * Admin - aloqa ma'lumotlarini yangilash.
   */
  async updateContacts(token: string, contacts: SiteContactsUpdate): Promise<SiteContacts> {
    const { data } = await adminApiInstance.put<SiteContacts>('/site-contacts', contacts, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  }
}
