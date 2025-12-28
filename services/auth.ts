import api from './api'
import Cookies from 'js-cookie'
import { User } from '@/types'

export interface LoginData {
  phone: string
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

export interface OTPRequestData {
  method: 'telegram' | 'email'
  phone?: string
  email?: string
}

export interface OTPVerifyData {
  method: 'telegram' | 'email'
  phone?: string
  email?: string
  otp_code: string
}

export interface PasswordResetData {
  method: 'telegram' | 'email'
  phone?: string
  email?: string
  otp_code: string
  new_password: string
  confirm_password: string
}

export interface OTPResponse {
  success: boolean
  message: string
  expires_in?: number
}

export interface TelegramStatusResponse {
  is_connected: boolean
  phone: string
  message: string
}

export type { User }

export const authService = {
  async login(data: LoginData) {
    const formData = new URLSearchParams()
    formData.append('phone', data.phone)
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

  // OTP funksiyalari
  async requestOTP(data: OTPRequestData): Promise<OTPResponse> {
    const response = await api.post('/auth/request-otp', data)
    return response.data
  },

  async verifyOTP(data: OTPVerifyData): Promise<OTPResponse> {
    const response = await api.post('/auth/verify-otp', data)
    return response.data
  },

  async resetPassword(data: PasswordResetData): Promise<OTPResponse> {
    const response = await api.post('/auth/reset-password', data)
    return response.data
  },

  async checkTelegramStatus(phone: string): Promise<TelegramStatusResponse> {
    const response = await api.post('/auth/check-telegram-status', { phone })
    return response.data
  },
}

