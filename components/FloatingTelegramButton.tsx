'use client'

import { useState } from 'react'
import ContactModal from './ContactModal'

export default function FloatingTelegramButton() {
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowContactModal(true)}
        className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Bo'g'lanish"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z"/>
        </svg>
      </button>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  )
}
