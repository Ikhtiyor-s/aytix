'use client'

import { useState, useEffect, useRef } from 'react'

interface Notification {
  id: number
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
  time: string
  read: boolean
}

export default function NotificationsDropdown() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'success', title: 'Yangi xabar', message: 'Admin sizga javob yozdi', time: '5 daqiqa oldin', read: false },
    { id: 2, type: 'info', title: 'Yangi loyiha', message: 'AI Chatbot Pro loyihasi qo\'shildi', time: '1 soat oldin', read: false },
    { id: 3, type: 'warning', title: 'Eslatma', message: 'Obuna muddati tugaydi', time: '2 soat oldin', read: false },
  ])
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-3 hover:bg-slate-100 rounded-full transition-all"
      >
        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="fixed top-20 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 dropdown-slide-down max-h-[600px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Bildirishnomalar</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Bildirishnomalar yo'q</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 ${
                    !notif.read ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'success' ? 'bg-green-100' :
                      notif.type === 'warning' ? 'bg-yellow-100' : 'bg-indigo-100'
                    }`}>
                      {notif.type === 'success' ? '✓' : notif.type === 'warning' ? '⚠' : 'ℹ'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{notif.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                      <span className="text-xs text-slate-500">{notif.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 text-center">
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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

