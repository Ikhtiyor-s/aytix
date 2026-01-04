import api from './api'
import Cookies from 'js-cookie'
import { User } from '@/types'

// ==================== Interfaces ====================

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

// OTP Interfaces
export interface SendOTPData {
  phone: string
  telegram_id?: string
  purpose: 'register' | 'login' | 'reset_password'
}

export interface SendOTPResponse {
  success: boolean
  message: string
  expires_in: number
}

export interface VerifyOTPData {
  phone: string
  code: string
  purpose: 'register' | 'login' | 'reset_password'
}

export interface VerifyOTPResponse {
  success: boolean
  message: string
  token?: string
}

export interface PhoneRegisterData {
  phone: string
  code: string
  telegram_id?: string
  first_name?: string
  last_name?: string
  password?: string
}

export interface PhoneLoginData {
  phone: string
  code: string
}

export interface ResetPasswordData {
  phone: string
  code: string
  new_password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export type { User }

// ==================== Auth Service ====================

export const authService = {
  // ==================== OTP Methods ====================

  /**
   * OTP kod yuborish (Telegram orqali)
   */
  async sendOTP(data: SendOTPData): Promise<SendOTPResponse> {
    const response = await api.post('/auth/otp/send', data)
    return response.data
  },

  /**
   * OTP kodni tekshirish
   */
  async verifyOTP(data: VerifyOTPData): Promise<VerifyOTPResponse> {
    const response = await api.post('/auth/otp/verify', data)
    return response.data
  },

  /**
   * OTP kodni qayta yuborish
   */
  async resendOTP(data: SendOTPData): Promise<SendOTPResponse> {
    const response = await api.post('/auth/otp/resend', data)
    return response.data
  },

  // ==================== Phone Auth Methods ====================

  /**
   * Telefon orqali ro'yxatdan o'tish (OTP tasdiqlangandan keyin)
   */
  async phoneRegister(data: PhoneRegisterData): Promise<TokenResponse> {
    const response = await api.post('/auth/phone/register', data)
    const { access_token, refresh_token } = response.data
    Cookies.set('access_token', access_token, { path: '/' })
    Cookies.set('refresh_token', refresh_token, { path: '/' })
    localStorage.setItem('access_token', access_token)
    return response.data
  },

  /**
   * Telefon va OTP orqali kirish
   */
  async phoneLogin(data: PhoneLoginData): Promise<TokenResponse> {
    const response = await api.post('/auth/phone/login', data)
    const { access_token, refresh_token } = response.data
    Cookies.set('access_token', access_token, { path: '/' })
    Cookies.set('refresh_token', refresh_token, { path: '/' })
    localStorage.setItem('access_token', access_token)
    return response.data
  },

  /**
   * Parolni tiklash (OTP tasdiqlangandan keyin)
   */
  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/password/reset', data)
    return response.data
  },

  // ==================== Legacy Methods (Email/Password) ====================

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
    localStorage.setItem('access_token', access_token)
    return response.data
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // ==================== User Methods ====================

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
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_profile')
  },

  isAuthenticated(): boolean {
    return Boolean(Cookies.get('access_token'))
  },
}
