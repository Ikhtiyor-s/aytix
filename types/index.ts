export interface User {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
  full_name?: string
  phone?: string
  profile_image?: string
  role: 'user' | 'admin' | 'seller'
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Product {
  id: number
  name: string
  name_uz?: string
  name_ru?: string
  name_en?: string
  description: string
  description_uz?: string
  description_ru?: string
  description_en?: string
  price: number
  category_id: number
  category?: Category
  image_url?: string
  images?: string[]
  stock: number
  status: 'active' | 'inactive'
  seller_id: number
  seller?: User
  created_at: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
  name_uz?: string
  name_ru?: string
  name_en?: string
  description?: string
  icon?: string
  parent_id?: number
  order: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Order {
  id: number
  user_id: number
  user?: User
  product_id: number
  product?: Product
  quantity: number
  total_price: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed'
  shipping_address?: string
  notes?: string
  created_at: string
  updated_at?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface Notification {
  id: number
  title: string
  title_uz?: string
  title_ru?: string
  title_en?: string
  content: string
  content_uz?: string
  content_ru?: string
  content_en?: string
  type: 'info' | 'warning' | 'success' | 'error'
  status: 'active' | 'inactive'
  created_at: string
  updated_at?: string
}
