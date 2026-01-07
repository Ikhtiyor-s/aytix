'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import ContactModal from './ContactModal'

export default function Footer() {
  const { t } = useLanguage()
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <footer className="bg-slate-900 text-slate-300 relative z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 py-2 sm:py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-[10px] sm:text-xs">
          {/* Logo */}
          <div className="col-span-2 sm:col-span-1">
            <img src="/aytixlogo.png" alt="AyTix" className="h-5 sm:h-6 w-auto brightness-0 invert mb-1" />
            <p className="text-slate-400 text-[10px] mb-1">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-1">
              <a href="https://t.me/aytixuz" target="_blank" rel="noopener noreferrer" className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href="https://instagram.com/aytix" target="_blank" rel="noopener noreferrer" className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center hover:bg-pink-600 transition-colors">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://youtube.com/@aytix" target="_blank" rel="noopener noreferrer" className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center hover:bg-red-600 transition-colors">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Hamkorlar */}
          <div>
            <h4 className="text-white font-semibold text-[10px] sm:text-xs mb-1">{t('footer.partners')}</h4>
            <div className="space-y-0.5 text-slate-400">
              <a href="https://nonbor.uz" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">WellTech</a>
              <a href="https://welltech.uz" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Nonbor</a>
              <a href="https://qrhub.uz" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">QRHUB</a>
            </div>
          </div>

          {/* Sahifalar */}
          <div>
            <h4 className="text-white font-semibold text-[10px] sm:text-xs mb-1">{t('footer.pages')}</h4>
            <div className="space-y-0.5">
              <a href="https://welltech.uz" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white block transition-colors">{t('footer.aboutUs')}</a>
              <button onClick={() => setShowContactModal(true)} className="text-slate-400 hover:text-white block transition-colors text-left">{t('footer.contact')}</button>
              <Link href="/faq" className="text-slate-400 hover:text-white block transition-colors">{t('footer.faq')}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </footer>
  )
}
