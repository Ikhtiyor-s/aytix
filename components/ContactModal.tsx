'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { footerService, FooterContact, FooterSocialLink } from '@/services/adminApi'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { t, language } = useLanguage()
  const modalRef = useRef<HTMLDivElement>(null)
  const [contacts, setContacts] = useState<FooterContact[]>([])
  const [socialLinks, setSocialLinks] = useState<FooterSocialLink[]>([])
  const [loading, setLoading] = useState(true)

  // Kontaktlarni va social linklarni yuklash
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await footerService.getFooterData()
        setContacts(data.contacts || [])
        setSocialLinks(data.social_links || [])
      } catch (error) {
        console.error('Kontaktlarni yuklashda xatolik:', error)
      } finally {
        setLoading(false)
      }
    }
    loadContacts()
  }, [])

  // Tashqariga bosganda yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // ESC tugmasi bilan yopish
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 sm:pt-32 bg-black/50 backdrop-blur-sm p-3">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden animate-modal-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {t('contact.title')}
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Telegram linklar (social_links va contacts) */}
              {(socialLinks.filter(s => s.platform === 'telegram' && s.is_active).length > 0 ||
                contacts.filter(c => c.contact_type === 'telegram' && c.is_active).length > 0) && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-[#229ED9]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </div>

                  {/* Social links dan Telegram */}
                  {socialLinks
                    .filter(s => s.platform === 'telegram' && s.is_active)
                    .sort((a, b) => a.order - b.order)
                    .map((social) => (
                    <a
                      key={`social-${social.id}`}
                      href={social.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-[#229ED9]/10 dark:hover:bg-[#229ED9]/20 border border-slate-200 dark:border-slate-600 hover:border-[#229ED9] transition-all group"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#229ED9] flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </div>
                      <span className="font-medium text-xs text-slate-900 dark:text-slate-100 group-hover:text-[#229ED9]">
                        {social.link_url.includes('t.me/') ? '@' + social.link_url.split('t.me/')[1] : social.link_url}
                      </span>
                    </a>
                  ))}

                  {/* Contacts dan Telegram */}
                  {contacts
                    .filter(c => c.contact_type === 'telegram' && c.is_active)
                    .sort((a, b) => a.order - b.order)
                    .map((contact) => (
                    <a
                      key={`contact-${contact.id}`}
                      href={contact.link_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-[#229ED9]/10 dark:hover:bg-[#229ED9]/20 border border-slate-200 dark:border-slate-600 hover:border-[#229ED9] transition-all group"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#229ED9] flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </div>
                      <span className="font-medium text-xs text-slate-900 dark:text-slate-100 group-hover:text-[#229ED9]">
                        {contact.value}
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {/* Telefon kontaktlari */}
              {contacts.filter(c => c.contact_type === 'phone' && c.is_active).length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {t('contact.phone')}
                  </div>
                  {contacts
                    .filter(c => c.contact_type === 'phone' && c.is_active)
                    .sort((a, b) => a.order - b.order)
                    .map((contact) => (
                    <a
                      key={contact.id}
                      href={contact.link_url || `tel:${contact.value}`}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 border border-slate-200 dark:border-slate-600 hover:border-green-500 transition-all group"
                    >
                      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="font-medium text-xs text-slate-900 dark:text-slate-100 group-hover:text-green-600">
                        {contact.value}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
