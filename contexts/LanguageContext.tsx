'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Language, languages, defaultLanguage } from '@/lib/languages'

interface LocalizedItem {
  name_uz: string
  name_ru?: string | null
  name_en?: string | null
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  getLocalizedName: (item: LocalizedItem) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Tarjimalar
const translations: Record<string, Record<string, string>> = {
  uz: {
    // Navbar
    'nav.home': 'Bosh sahifa',
    'nav.marketplace': 'Marketplace',
    'nav.orders': 'Buyurtmalar',
    'nav.settings': 'Sozlamalar',
    'nav.profile': 'Profil',
    'nav.logout': 'Chiqish',
    'nav.login': 'Kirish',
    'nav.register': "Ro'yxatdan o'tish",
    'nav.search': 'Qidirish...',
    'nav.notifications': 'Bildirishnomalar',
    'nav.favorites': 'Sevimlilar',

    // Categories
    'categories.all': 'Barcha kategoriyalar',
    'categories.web': 'Veb dasturlash',
    'categories.mobile': 'Mobil ilovalar',
    'categories.design': 'Dizayn',
    'categories.marketing': 'Marketing',
    'categories.writing': 'Yozish',
    'categories.video': 'Video va animatsiya',
    'categories.music': 'Musiqa va audio',
    'categories.business': 'Biznes',
    'categories.lifestyle': 'Turmush tarzi',
    'categories.data': 'Ma\'lumotlar',
    'categories.ai': 'AI xizmatlari',

    // Home page
    'home.hero.title': 'Aytix Marketplace',
    'home.hero.subtitle': 'Eng yaxshi xizmatlar va mahsulotlar',
    'home.featured': 'Tavsiya etilgan',
    'home.popular': 'Mashhur',
    'home.new': 'Yangi',

    // Product
    'product.price': 'Narxi',
    'product.buy': 'Sotib olish',
    'product.addToCart': 'Savatga qo\'shish',
    'product.description': 'Tavsif',
    'product.reviews': 'Sharhlar',
    'product.seller': 'Sotuvchi',
    'product.delivery': 'Yetkazib berish',
    'product.rating': 'Reyting',

    // Orders
    'orders.title': 'Buyurtmalarim',
    'orders.empty': 'Buyurtmalar yo\'q',
    'orders.status.pending': 'Kutilmoqda',
    'orders.status.processing': 'Jarayonda',
    'orders.status.completed': 'Yakunlangan',
    'orders.status.cancelled': 'Bekor qilingan',

    // Settings
    'settings.title': 'Sozlamalar',
    'settings.account': 'Hisob',
    'settings.notifications': 'Bildirishnomalar',
    'settings.privacy': 'Maxfiylik',
    'settings.language': 'Til',
    'settings.theme': 'Mavzu',
    'settings.save': 'Saqlash',

    // Auth
    'auth.login': 'Kirish',
    'auth.register': "Ro'yxatdan o'tish",
    'auth.email': 'Email',
    'auth.password': 'Parol',
    'auth.confirmPassword': 'Parolni tasdiqlang',
    'auth.forgotPassword': 'Parolni unutdingizmi?',
    'auth.rememberMe': 'Meni eslab qol',
    'auth.noAccount': "Hisobingiz yo'qmi?",
    'auth.hasAccount': 'Hisobingiz bormi?',
    'auth.name': 'Ism',
    'auth.phone': 'Telefon',

    // Footer
    'footer.about': 'Biz haqimizda',
    'footer.contact': 'Aloqa',
    'footer.terms': 'Foydalanish shartlari',
    'footer.privacy': 'Maxfiylik siyosati',
    'footer.help': 'Yordam',
    'footer.faq': 'Ko\'p so\'raladigan savollar',
    'footer.support': 'Qo\'llab-quvvatlash',
    'footer.copyright': 'Barcha huquqlar himoyalangan',

    // Common
    'common.loading': 'Yuklanmoqda...',
    'common.error': 'Xatolik yuz berdi',
    'common.retry': 'Qayta urinish',
    'common.cancel': 'Bekor qilish',
    'common.confirm': 'Tasdiqlash',
    'common.save': 'Saqlash',
    'common.delete': 'O\'chirish',
    'common.edit': 'Tahrirlash',
    'common.view': 'Ko\'rish',
    'common.close': 'Yopish',
    'common.search': 'Qidirish',
    'common.filter': 'Filtrlash',
    'common.sort': 'Saralash',
    'common.next': 'Keyingi',
    'common.prev': 'Oldingi',
    'common.seeAll': 'Hammasini ko\'rish',
    'common.clearFilter': 'Filtrni tozalash',
    'common.page': 'Sahifa',

    // Marketplace
    'marketplace.allProjects': 'Barcha loyihalar',
    'marketplace.projects': 'loyiha',
    'marketplace.searchPlaceholder': 'Loyihalarni qidirish...',
    'marketplace.noProjects': 'Loyihalar topilmadi',
    'marketplace.loadingProjects': 'Loyihalar yuklanmoqda...',
    'marketplace.contactAdmin': 'Adminga murojaat',

    // Banner
    'banner.details': 'Batafsil',

    // Footer
    'footer.description': 'IT loyihalar marketpleysi',
    'footer.partners': 'Hamkorlar',
    'footer.pages': 'Sahifalar',
    'footer.aboutUs': 'Biz haqimizda',
    'footer.contactUs': "Bog'lanish",

    // Categories sidebar
    'categories.title': 'Kategoriyalar',
    'categories.showAll': 'Barchasi',

    // Project detail
    'project.images': 'Rasmlar',
    'project.imagesAndVideo': 'Rasmlar va Video',
    'project.stats': 'Statistika',
    'project.views': "Ko'rishlar",
    'project.contact': "Bog'lanish",
    'project.features': 'Xususiyatlar',
    'project.info': "Ma'lumot",
    'project.status': 'Status',
    'project.active': 'Faol',
    'project.inactive': 'Nofaol',
    'project.addedDate': "Qo'shilgan",
    'project.technologies': 'Texnologiyalar',
    'project.integrations': 'Integratsiyalar',
    'project.similarProjects': "O'xshash loyihalar",
    'project.viewAll': "Barchasini ko'rish",
    'project.back': 'Orqaga',
    'project.notFound': 'Loyiha topilmadi',
    'project.backToMarket': 'Marketga qaytish',
    'project.noDescription': 'Tavsif mavjud emas',

    // Contact Modal
    'contact.title': "Bog'lanish",
    'contact.phone': 'Telefon',
  },
  ru: {
    // Navbar
    'nav.home': 'Главная',
    'nav.marketplace': 'Маркетплейс',
    'nav.orders': 'Заказы',
    'nav.settings': 'Настройки',
    'nav.profile': 'Профиль',
    'nav.logout': 'Выйти',
    'nav.login': 'Войти',
    'nav.register': 'Регистрация',
    'nav.search': 'Поиск...',
    'nav.notifications': 'Уведомления',
    'nav.favorites': 'Избранное',

    // Categories
    'categories.all': 'Все категории',
    'categories.web': 'Веб-разработка',
    'categories.mobile': 'Мобильные приложения',
    'categories.design': 'Дизайн',
    'categories.marketing': 'Маркетинг',
    'categories.writing': 'Копирайтинг',
    'categories.video': 'Видео и анимация',
    'categories.music': 'Музыка и аудио',
    'categories.business': 'Бизнес',
    'categories.lifestyle': 'Лайфстайл',
    'categories.data': 'Данные',
    'categories.ai': 'AI сервисы',

    // Home page
    'home.hero.title': 'Aytix Маркетплейс',
    'home.hero.subtitle': 'Лучшие услуги и продукты',
    'home.featured': 'Рекомендуемые',
    'home.popular': 'Популярные',
    'home.new': 'Новые',

    // Product
    'product.price': 'Цена',
    'product.buy': 'Купить',
    'product.addToCart': 'В корзину',
    'product.description': 'Описание',
    'product.reviews': 'Отзывы',
    'product.seller': 'Продавец',
    'product.delivery': 'Доставка',
    'product.rating': 'Рейтинг',

    // Orders
    'orders.title': 'Мои заказы',
    'orders.empty': 'Нет заказов',
    'orders.status.pending': 'В ожидании',
    'orders.status.processing': 'В обработке',
    'orders.status.completed': 'Завершен',
    'orders.status.cancelled': 'Отменен',

    // Settings
    'settings.title': 'Настройки',
    'settings.account': 'Аккаунт',
    'settings.notifications': 'Уведомления',
    'settings.privacy': 'Приватность',
    'settings.language': 'Язык',
    'settings.theme': 'Тема',
    'settings.save': 'Сохранить',

    // Auth
    'auth.login': 'Вход',
    'auth.register': 'Регистрация',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.rememberMe': 'Запомнить меня',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.hasAccount': 'Уже есть аккаунт?',
    'auth.name': 'Имя',
    'auth.phone': 'Телефон',

    // Footer
    'footer.about': 'О нас',
    'footer.contact': 'Контакты',
    'footer.terms': 'Условия использования',
    'footer.privacy': 'Политика конфиденциальности',
    'footer.help': 'Помощь',
    'footer.faq': 'Часто задаваемые вопросы',
    'footer.support': 'Поддержка',
    'footer.copyright': 'Все права защищены',

    // Common
    'common.loading': 'Загрузка...',
    'common.error': 'Произошла ошибка',
    'common.retry': 'Повторить',
    'common.cancel': 'Отмена',
    'common.confirm': 'Подтвердить',
    'common.save': 'Сохранить',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.view': 'Просмотр',
    'common.close': 'Закрыть',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.sort': 'Сортировка',
    'common.next': 'Далее',
    'common.prev': 'Назад',
    'common.seeAll': 'Смотреть все',
    'common.clearFilter': 'Сбросить фильтр',
    'common.page': 'Страница',

    // Marketplace
    'marketplace.allProjects': 'Все проекты',
    'marketplace.projects': 'проектов',
    'marketplace.searchPlaceholder': 'Поиск проектов...',
    'marketplace.noProjects': 'Проекты не найдены',
    'marketplace.loadingProjects': 'Загрузка проектов...',
    'marketplace.contactAdmin': 'Связаться с админом',

    // Banner
    'banner.details': 'Подробнее',

    // Footer
    'footer.description': 'Маркетплейс IT проектов',
    'footer.partners': 'Партнеры',
    'footer.pages': 'Страницы',
    'footer.aboutUs': 'О нас',
    'footer.contactUs': 'Связаться',

    // Categories sidebar
    'categories.title': 'Категории',
    'categories.showAll': 'Все',

    // Project detail
    'project.images': 'Изображения',
    'project.imagesAndVideo': 'Изображения и видео',
    'project.stats': 'Статистика',
    'project.views': 'Просмотры',
    'project.contact': 'Связаться',
    'project.features': 'Возможности',
    'project.info': 'Информация',
    'project.status': 'Статус',
    'project.active': 'Активен',
    'project.inactive': 'Неактивен',
    'project.addedDate': 'Добавлен',
    'project.technologies': 'Технологии',
    'project.integrations': 'Интеграции',
    'project.similarProjects': 'Похожие проекты',
    'project.viewAll': 'Смотреть все',
    'project.back': 'Назад',
    'project.notFound': 'Проект не найден',
    'project.backToMarket': 'Вернуться на маркет',
    'project.noDescription': 'Описание отсутствует',

    // Contact Modal
    'contact.title': 'Связаться',
    'contact.phone': 'Телефон',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.orders': 'Orders',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.search': 'Search...',
    'nav.notifications': 'Notifications',
    'nav.favorites': 'Favorites',

    // Categories
    'categories.all': 'All categories',
    'categories.web': 'Web Development',
    'categories.mobile': 'Mobile Apps',
    'categories.design': 'Design',
    'categories.marketing': 'Marketing',
    'categories.writing': 'Writing',
    'categories.video': 'Video & Animation',
    'categories.music': 'Music & Audio',
    'categories.business': 'Business',
    'categories.lifestyle': 'Lifestyle',
    'categories.data': 'Data',
    'categories.ai': 'AI Services',

    // Home page
    'home.hero.title': 'Aytix Marketplace',
    'home.hero.subtitle': 'Best services and products',
    'home.featured': 'Featured',
    'home.popular': 'Popular',
    'home.new': 'New',

    // Product
    'product.price': 'Price',
    'product.buy': 'Buy Now',
    'product.addToCart': 'Add to Cart',
    'product.description': 'Description',
    'product.reviews': 'Reviews',
    'product.seller': 'Seller',
    'product.delivery': 'Delivery',
    'product.rating': 'Rating',

    // Orders
    'orders.title': 'My Orders',
    'orders.empty': 'No orders',
    'orders.status.pending': 'Pending',
    'orders.status.processing': 'Processing',
    'orders.status.completed': 'Completed',
    'orders.status.cancelled': 'Cancelled',

    // Settings
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.save': 'Save',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember me',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.name': 'Name',
    'auth.phone': 'Phone',

    // Footer
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.help': 'Help',
    'footer.faq': 'FAQ',
    'footer.support': 'Support',
    'footer.copyright': 'All rights reserved',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.seeAll': 'See All',
    'common.clearFilter': 'Clear filter',
    'common.page': 'Page',

    // Marketplace
    'marketplace.allProjects': 'All projects',
    'marketplace.projects': 'projects',
    'marketplace.searchPlaceholder': 'Search projects...',
    'marketplace.noProjects': 'No projects found',
    'marketplace.loadingProjects': 'Loading projects...',
    'marketplace.contactAdmin': 'Contact Admin',

    // Banner
    'banner.details': 'Details',

    // Footer
    'footer.description': 'IT projects marketplace',
    'footer.partners': 'Partners',
    'footer.pages': 'Pages',
    'footer.aboutUs': 'About Us',
    'footer.contactUs': 'Contact',

    // Categories sidebar
    'categories.title': 'Categories',
    'categories.showAll': 'All',

    // Project detail
    'project.images': 'Images',
    'project.imagesAndVideo': 'Images and Video',
    'project.stats': 'Statistics',
    'project.views': 'Views',
    'project.contact': 'Contact',
    'project.features': 'Features',
    'project.info': 'Information',
    'project.status': 'Status',
    'project.active': 'Active',
    'project.inactive': 'Inactive',
    'project.addedDate': 'Added',
    'project.technologies': 'Technologies',
    'project.integrations': 'Integrations',
    'project.similarProjects': 'Similar projects',
    'project.viewAll': 'View all',
    'project.back': 'Back',
    'project.notFound': 'Project not found',
    'project.backToMarket': 'Back to market',
    'project.noDescription': 'No description available',

    // Contact Modal
    'contact.title': 'Contact Us',
    'contact.phone': 'Phone',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)

  useEffect(() => {
    const savedLangCode = localStorage.getItem('language')
    if (savedLangCode) {
      const savedLang = languages.find(l => l.code === savedLangCode)
      if (savedLang) {
        setLanguageState(savedLang)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang.code)
  }

  const t = (key: string): string => {
    return translations[language.code]?.[key] || translations['uz'][key] || key
  }

  const getLocalizedName = (item: LocalizedItem): string => {
    if (language.code === 'ru' && item.name_ru) return item.name_ru
    if (language.code === 'en' && item.name_en) return item.name_en
    return item.name_uz
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedName }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
