// Shared types across the application

export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  first_name?: string
  last_name?: string
  phone?: string
  profile_image?: string
  role: 'user' | 'seller' | 'admin'
  is_active: boolean
  created_at: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  image_url?: string
  category_id?: number
  seller_id: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at?: string
  seller?: User
  category?: Category
}

export interface Category {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
}

export interface Order {
  id: number
  buyer_id: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at?: string
  buyer?: User
  items: OrderItem[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface ApiError {
  detail: string | { [key: string]: string[] }
}


