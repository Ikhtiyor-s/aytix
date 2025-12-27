'use client'

import { useState, useEffect, useRef } from 'react'
import { notificationsService, FormattedNotification } from '@/services/notifications'

export default function NotificationsDropdown() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState<FormattedNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Bildirishnomalarni yuklash
  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationsService.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  // Komponent mount bo'lganda yuklash
  useEffect(() => {
    if (mounted) {
      loadNotifications()
    }
  }, [mounted])

  // Dropdown ochilganda qayta yuklash
  useEffect(() => {
    if (showDropdown) {
      loadNotifications()
    }
  }, [showDropdown])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    notificationsService.markAsRead(id)
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id)
    notificationsService.markAllAsRead(allIds)
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  // Server-side rendering - placeholder
  if (!mounted) {
    return (
      <div className="relative">
        <button className="relative p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-all">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-all"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-red-500 text-white text-[8px] sm:text-[9px] rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="fixed right-0 top-14 w-[40%] max-w-[400px] bg-white rounded-l-xl shadow-2xl border border-slate-100 z-50 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base text-slate-800">Bildirishnomalar</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">Yuklanmoqda...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">Bildirishnomalar yo'q</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3 sm:p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 ${
                    !notif.read ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base ${
                      notif.type === 'success' ? 'bg-green-100' :
                      notif.type === 'warning' ? 'bg-yellow-100' : 'bg-indigo-100'
                    }`}>
                      {notif.type === 'success' ? '✓' : notif.type === 'warning' ? '⚠' : 'ℹ'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mb-0.5 sm:mb-1 truncate">{notif.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2 line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] sm:text-xs text-slate-500">{notif.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-2 sm:p-3 border-t border-slate-100 text-center">
              <button
                onClick={markAllAsRead}
                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Hammasini o'qilgan deb belgilash
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
