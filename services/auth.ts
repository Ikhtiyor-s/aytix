import api from './api'
import Cookies from 'js-cookie'
import { User } from '@/types'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  full_name?: string
  first_name?: string
  last_name?: string
  phone?: string
}

export type { User }

export const authService = {
  async login(data: LoginData) {
    const formData = new URLSearchParams()
    formData.append('email', data.email)
    formData.append('password', data.password)
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    const { access_token, refresh_token } = response.data
    Cookies.set('access_token', access_token, { path: '/' })
    Cookies.set('refresh_token', refresh_token, { path: '/' })
    return response.data
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me')
    return response.data
  },

  async updateProfile(data: { first_name?: string; last_name?: string; profile_image?: string }): Promise<User> {
    const response = await api.put('/users/me', data)
    return response.data
  },

  async logout() {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  },

  isAuthenticated(): boolean {
  return Boolean(Cookies.get('access_token'))
  },
}

