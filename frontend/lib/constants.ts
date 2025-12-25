/**
 * Application constants
 */

export const ROLES = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const

export const PRODUCT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const ROUTES = {
  HOME: '/',
  MARKETPLACE: '/marketplace',
  LOGIN: '/login',
  REGISTER: '/register',
  ORDERS: '/orders',
  SELLER: '/seller',
  ADMIN: '/admin',
  PRODUCTS: '/products',
} as const


