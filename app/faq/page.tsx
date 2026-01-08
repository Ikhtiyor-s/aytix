'use client'

import { useState, useEffect } from 'react'
import { faqService, FAQ } from '@/services/adminApi'
import { useLanguage } from '@/contexts/LanguageContext'
import Loading from '@/components/ui/Loading'
import ContactModal from '@/components/ContactModal'

export default function FAQPage() {
  const { language, t } = useLanguage()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    loadFAQs()
  }, [])

  const loadFAQs = async () => {
    setLoading(true)
    try {
      const data = await faqService.getFAQs()
      setFaqs(data)
    } catch (error) {
      console.error('Failed to load FAQs', error)
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  // Savolni tilga qarab olish
  const getQuestion = (faq: FAQ): string => {
    if (language.code === 'ru' && faq.question_ru) return faq.question_ru
    if (language.code === 'en' && faq.question_en) return faq.question_en
    return faq.question_uz
  }

  // Javobni tilga qarab olish
  const getAnswer = (faq: FAQ): string => {
    if (language.code === 'ru' && faq.answer_ru) return faq.answer_ru
    if (language.code === 'en' && faq.answer_en) return faq.answer_en
    return faq.answer_uz
  }

  // Kategoriyalarni olish
  // Kategoriyalarni olish
  const categories = Array.from(new Set(faqs.map(f => f.category).filter(Boolean))) as string[]

  // Filtrlangan FAQ lar
  const filteredFaqs = selectedCategory
    ? faqs.filter(f => f.category === selectedCategory)
    : faqs

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // Til bo'yicha sarlavhalar
  const pageTitle = {
    uz: "Ko'p so'raladigan savollar",
    ru: "Часто задаваемые вопросы",
    en: "Frequently Asked Questions"
  }

  const allCategoriesText = {
    uz: "Barcha savollar",
    ru: "Все вопросы",
    en: "All questions"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {pageTitle[language.code as keyof typeof pageTitle]}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {language.code === 'uz' && "AyTix platformasi haqida eng ko'p beriladigan savollarga javoblar"}
            {language.code === 'ru' && "Ответы на самые популярные вопросы о платформе AyTix"}
            {language.code === 'en' && "Answers to the most frequently asked questions about AyTix platform"}
          </p>
        </div>

        {/* Kategoriya filtrlari */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {allCategoriesText[language.code as keyof typeof allCategoriesText]}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* FAQ ro'yxati */}
        {loading ? (
          <Loading text={language.code === 'uz' ? 'Yuklanmoqda...' : language.code === 'ru' ? 'Загрузка...' : 'Loading...'} />
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <p className="text-slate-600 dark:text-slate-400">
              {language.code === 'uz' && "Hozircha savollar mavjud emas"}
              {language.code === 'ru' && "Пока нет вопросов"}
              {language.code === 'en' && "No questions available yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white pr-4">
                      {getQuestion(faq)}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openIndex === index && (
                  <div className="px-5 pb-4 pt-0">
                    <div className="pl-11 border-l-2 border-indigo-200 dark:border-indigo-800 ml-4">
                      <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                        {getAnswer(faq)}
                      </p>
                      {faq.category && (
                        <span className="inline-block mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                          {faq.category}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Qo'shimcha yordam */}
        <div className="mt-12 text-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-2">
            {language.code === 'uz' && "Savolingizga javob topa olmadingizmi?"}
            {language.code === 'ru' && "Не нашли ответ на свой вопрос?"}
            {language.code === 'en' && "Didn't find the answer to your question?"}
          </h3>
          <p className="text-indigo-100 mb-4">
            {language.code === 'uz' && "Biz bilan bog'laning, yordam beramiz!"}
            {language.code === 'ru' && "Свяжитесь с нами, мы поможем!"}
            {language.code === 'en' && "Contact us, we'll help!"}
          </p>
          <button
            onClick={() => setShowContactModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            {language.code === 'uz' && "Bo'g'lanish"}
            {language.code === 'ru' && "Связаться"}
            {language.code === 'en' && "Contact us"}
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  )
}
