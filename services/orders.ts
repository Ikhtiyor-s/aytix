import api from './api'
import { Order, PaginatedResponse } from '@/types'

export interface OrderCreate {
  items: Array<{
    product_id: number
    quantity: number
  }>
}

export type { Order, PaginatedResponse }

export const ordersService = {
  async createOrder(data: OrderCreate): Promise<Order> {
    const response = await api.post('/orders', data)
    return response.data
  },

  async getOrders(page = 1, pageSize = 20): Promise<PaginatedResponse<Order>> {
    const response = await api.get('/orders', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  async getOrder(id: number): Promise<Order> {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },
}


