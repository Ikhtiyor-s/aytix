// =============================================================================
// TYPES - Kategoriyalar
// =============================================================================

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

// =============================================================================
// TYPES - Loyihalar
// =============================================================================

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
  images: string[] | null
  video_url: string | null
  views: number
  favorites: number
  status: 'active' | 'inactive'
  is_top: boolean
  is_new: boolean
  is_verified: boolean
  created_at: string
  updated_at: string | null
}

export interface ProjectsParams {
  skip?: number
  limit?: number
  category?: string
  subcategory?: string
  status?: string
  is_top?: boolean
  is_new?: boolean
  search?: string
}

export interface ProjectCounts {
  categories: Record<string, number>
  subcategories: Record<string, number>
}

// =============================================================================
// TYPES - Bannerlar
// =============================================================================

export interface Banner {
  id: number
  title_uz: string
  title_ru: string | null
  title_en: string | null
  description_uz: string | null
  description_ru: string | null
  description_en: string | null
  image_url: string | null
  video_url: string | null
  link_url: string | null
  project_id: number | null
  order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string | null
}

// =============================================================================
// TYPES - Hamkorlar
// =============================================================================

export interface Partner {
  id: number
  name: string
  logo_url: string | null
  website: string | null
  description_uz: string | null
  description_ru: string | null
  description_en: string | null
  partner_type: string | null
  order: number
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string | null
}

// =============================================================================
// TYPES - Xabarnomalar
// =============================================================================

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

// =============================================================================
// TYPES - Xabarlar (Contact Form)
// =============================================================================

export interface MessageCreate {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface Message {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  reply: string | null
  replied_at: string | null
  created_at: string
  updated_at: string | null
}

// =============================================================================
// TYPES - FAQ (Ko'p so'raladigan savollar)
// =============================================================================

export interface FAQ {
  id: number
  question_uz: string
  question_ru: string | null
  question_en: string | null
  answer_uz: string
  answer_ru: string | null
  answer_en: string | null
  category: string | null
  order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string | null
}

export interface FAQCreate {
  question_uz: string
  question_ru?: string
  question_en?: string
  answer_uz: string
  answer_ru?: string
  answer_en?: string
  category?: string
  order?: number
  status?: 'active' | 'inactive'
}

export interface FAQUpdate {
  question_uz?: string
  question_ru?: string
  question_en?: string
  answer_uz?: string
  answer_ru?: string
  answer_en?: string
  category?: string
  order?: number
  status?: 'active' | 'inactive'
}

// =============================================================================
// TYPES - Footer
// =============================================================================

export interface FooterItem {
  id: number
  title_uz: string
  title_ru: string | null
  title_en: string | null
  url: string
  icon: string | null
  is_external: boolean
  order: number
  is_active: boolean
}

export interface FooterSection {
  id: number
  title_uz: string
  title_ru: string | null
  title_en: string | null
  slug: string
  order: number
  is_active: boolean
  items: FooterItem[]
}

export interface FooterSocialLink {
  id: number
  platform: string
  link_url: string
  icon: string | null
  order: number
  is_active: boolean
}

export interface FooterContact {
  id: number
  contact_type: string
  label_uz: string
  label_ru: string | null
  label_en: string | null
  value: string
  icon: string | null
  link_url: string | null
  order: number
  is_active: boolean
}

export interface FooterData {
  sections: FooterSection[]
  social_links: FooterSocialLink[]
  contacts: FooterContact[]
}

// =============================================================================
// TYPES - Site Contacts (Sayt aloqa ma'lumotlari)
// =============================================================================

export interface SiteContacts {
  id: number
  phone_primary: string
  phone_secondary: string | null
  telegram_username: string | null
  telegram_url: string | null
  whatsapp_number: string | null
  email_primary: string | null
  email_secondary: string | null
  address_uz: string | null
  address_ru: string | null
  address_en: string | null
  working_hours_uz: string | null
  working_hours_ru: string | null
  working_hours_en: string | null
  additional_info_uz: string | null
  additional_info_ru: string | null
  additional_info_en: string | null
  created_at: string
  updated_at: string | null
}

export interface SiteContactsUpdate {
  phone_primary?: string
  phone_secondary?: string
  telegram_username?: string
  telegram_url?: string
  whatsapp_number?: string
  email_primary?: string
  email_secondary?: string
  address_uz?: string
  address_ru?: string
  address_en?: string
  working_hours_uz?: string
  working_hours_ru?: string
  working_hours_en?: string
  additional_info_uz?: string
  additional_info_ru?: string
  additional_info_en?: string
}
