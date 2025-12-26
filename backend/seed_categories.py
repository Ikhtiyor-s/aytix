"""
Seed script to add initial project categories with subcategories
"""
import requests
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000/api/v1"

# Login to get token
login_data = {
    "email": "901009300@temp.uz",
    "password": "123456"
}

print("Logging in...")
response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if response.status_code == 200:
    token_data = response.json()
    access_token = token_data["access_token"]
    print("✓ Logged in successfully\n")
else:
    print(f"✗ Login failed: {response.text}")
    sys.exit(1)

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Define categories with subcategories
categories_data = [
    {
        "name_uz": "Biznes va Avtomatlashtirish",
        "name_ru": "Бизнес и Автоматизация",
        "name_en": "Business & Automation",
        "description_uz": "CRM, ERP va biznes jarayonlarini avtomatlashtirish tizimlari",
        "icon": "1️⃣",
        "order": 1,
        "subcategories": [
            {"name_uz": "CRM tizimlari", "name_ru": "CRM системы", "name_en": "CRM systems"},
            {"name_uz": "ERP tizimlari", "name_ru": "ERP системы", "name_en": "ERP systems"},
            {"name_uz": "Ombor va inventar boshqaruvi", "name_ru": "Управление складом", "name_en": "Warehouse management"},
            {"name_uz": "Buyurtma va savdo boshqaruvi", "name_ru": "Управление заказами", "name_en": "Order management"},
            {"name_uz": "Hisob-kitob va billing", "name_ru": "Биллинг", "name_en": "Billing"},
            {"name_uz": "Kadrlar (HR) tizimlari", "name_ru": "HR системы", "name_en": "HR systems"},
            {"name_uz": "Avtomatik hisobotlar", "name_ru": "Автоотчеты", "name_en": "Auto reports"},
            {"name_uz": "Raqamli hujjatlashtirish", "name_ru": "Электронный документооборот", "name_en": "Digital documentation"}
        ]
    },
    {
        "name_uz": "Savdo va Marketing",
        "name_ru": "Продажи и Маркетинг",
        "name_en": "Sales & Marketing",
        "description_uz": "E-commerce, reklama va marketing avtomatlashtirish",
        "icon": "2️⃣",
        "order": 2,
        "subcategories": [
            {"name_uz": "Onlayn savdo platformalari", "name_ru": "Онлайн платформы продаж", "name_en": "Online sales platforms"},
            {"name_uz": "Internet do'konlar", "name_ru": "Интернет-магазины", "name_en": "E-commerce"},
            {"name_uz": "Reklama boshqaruvi", "name_ru": "Управление рекламой", "name_en": "Ads management"},
            {"name_uz": "SMM va kontent rejalashtirish", "name_ru": "SMM и планирование контента", "name_en": "SMM & content planning"},
            {"name_uz": "Lead generation tizimlari", "name_ru": "Системы лидогенерации", "name_en": "Lead generation"},
            {"name_uz": "Email & SMS marketing", "name_ru": "Email & SMS маркетинг", "name_en": "Email & SMS marketing"},
            {"name_uz": "Call-center avtomatlashtirish", "name_ru": "Автоматизация call-центра", "name_en": "Call center automation"},
            {"name_uz": "Affiliate marketing tizimlari", "name_ru": "Партнерский маркетинг", "name_en": "Affiliate marketing"}
        ]
    },
    {
        "name_uz": "Moliyaviy Texnologiyalar",
        "name_ru": "Финансовые Технологии",
        "name_en": "Financial Technologies",
        "description_uz": "Buxgalteriya, to'lov tizimlari va moliyaviy xizmatlar",
        "icon": "3️⃣",
        "order": 3,
        "subcategories": [
            {"name_uz": "Buxgalteriya dasturlari", "name_ru": "Бухгалтерские программы", "name_en": "Accounting software"},
            {"name_uz": "Soliq va hisobot tizimlari", "name_ru": "Налоговая отчетность", "name_en": "Tax reporting"},
            {"name_uz": "To'lov integratsiyalari", "name_ru": "Платежные интеграции", "name_en": "Payment integrations"},
            {"name_uz": "Bank API va billing", "name_ru": "Банковский API", "name_en": "Bank API & billing"},
            {"name_uz": "Kredit va qarz boshqaruvi", "name_ru": "Управление кредитами", "name_en": "Loan management"},
            {"name_uz": "Kassa va POS tizimlari", "name_ru": "Кассовые системы", "name_en": "POS systems"},
            {"name_uz": "Valyuta va konvertatsiya", "name_ru": "Валюта и конвертация", "name_en": "Currency conversion"},
            {"name_uz": "Obuna tizimlari", "name_ru": "Системы подписок", "name_en": "Subscription systems"}
        ]
    },
    {
        "name_uz": "Ta'lim va O'rganish",
        "name_ru": "Образование и Обучение",
        "name_en": "Education & Learning",
        "description_uz": "LMS, online ta'lim va test platformalari",
        "icon": "4️⃣",
        "order": 4,
        "subcategories": [
            {"name_uz": "LMS platformalari", "name_ru": "LMS платформы", "name_en": "LMS platforms"},
            {"name_uz": "Test va imtihon tizimlari", "name_ru": "Системы тестирования", "name_en": "Testing systems"},
            {"name_uz": "Video dars platformalari", "name_ru": "Видеоуроки", "name_en": "Video lesson platforms"},
            {"name_uz": "O'quvchilarni boshqarish", "name_ru": "Управление студентами", "name_en": "Student management"},
            {"name_uz": "Sertifikatlash tizimlari", "name_ru": "Сертификация", "name_en": "Certification systems"},
            {"name_uz": "Trening va webinar", "name_ru": "Тренинги и вебинары", "name_en": "Training & webinars"},
            {"name_uz": "Onlayn kurs marketplace", "name_ru": "Маркетплейс курсов", "name_en": "Course marketplace"},
            {"name_uz": "AI yordamchi o'qituvchilar", "name_ru": "AI помощники", "name_en": "AI tutors"}
        ]
    },
    {
        "name_uz": "AI va Avtomatik Yordamchilar",
        "name_ru": "AI и Автоматические Помощники",
        "name_en": "AI & Automation Assistants",
        "description_uz": "Chatbot, AI analytics va sun'iy intellekt yechimlari",
        "icon": "6️⃣",
        "order": 6,
        "subcategories": [
            {"name_uz": "Chatbotlar (Telegram / Web)", "name_ru": "Чат-боты", "name_en": "Chatbots"},
            {"name_uz": "AI konsultantlar", "name_ru": "AI консультанты", "name_en": "AI consultants"},
            {"name_uz": "Matn, rasm va video AI", "name_ru": "AI генерация контента", "name_en": "AI content generation"},
            {"name_uz": "Ovoz orqali boshqaruv", "name_ru": "Голосовое управление", "name_en": "Voice control"},
            {"name_uz": "AI analytics va prognoz", "name_ru": "AI аналитика", "name_en": "AI analytics"},
            {"name_uz": "Tavsiya tizimlari", "name_ru": "Рекомендательные системы", "name_en": "Recommendation systems"},
            {"name_uz": "Avtomatik javob beruvchi", "name_ru": "Автоответчики", "name_en": "Auto-responders"},
            {"name_uz": "Custom AI yechimlar", "name_ru": "Кастомные AI решения", "name_en": "Custom AI solutions"}
        ]
    },
    {
        "name_uz": "Mobil va Veb Ilovalar",
        "name_ru": "Мобильные и Веб Приложения",
        "name_en": "Mobile & Web Apps",
        "description_uz": "Flutter, React, API va dasturiy ta'minot ishlab chiqish",
        "icon": "7️⃣",
        "order": 7,
        "subcategories": [
            {"name_uz": "Mobil ilovalar", "name_ru": "Мобильные приложения", "name_en": "Mobile apps"},
            {"name_uz": "Veb platformalar", "name_ru": "Веб платформы", "name_en": "Web platforms"},
            {"name_uz": "Admin panellar", "name_ru": "Админ панели", "name_en": "Admin panels"},
            {"name_uz": "Landing page va saytlar", "name_ru": "Лендинги и сайты", "name_en": "Landing pages"},
            {"name_uz": "Progressive Web App", "name_ru": "PWA", "name_en": "PWA"},
            {"name_uz": "API va backend", "name_ru": "API и бэкенд", "name_en": "API & backend"},
            {"name_uz": "SaaS platformalar", "name_ru": "SaaS платформы", "name_en": "SaaS platforms"},
            {"name_uz": "UI/UX dizayn", "name_ru": "UI/UX дизайн", "name_en": "UI/UX design"}
        ]
    },
    {
        "name_uz": "Logistika va Yetkazib Berish",
        "name_ru": "Логистика и Доставка",
        "name_en": "Logistics & Delivery",
        "description_uz": "Yetkazib berish, kuryer va marshrut tizimlari",
        "icon": "9️⃣",
        "order": 9,
        "subcategories": [
            {"name_uz": "Yetkazib berish tizimlari", "name_ru": "Системы доставки", "name_en": "Delivery systems"},
            {"name_uz": "Kuryer boshqaruvi", "name_ru": "Управление курьерами", "name_en": "Courier management"},
            {"name_uz": "Marshrut optimizatsiyasi", "name_ru": "Оптимизация маршрутов", "name_en": "Route optimization"},
            {"name_uz": "Buyurtma tracking", "name_ru": "Трекинг заказов", "name_en": "Order tracking"},
            {"name_uz": "Ombor logistika", "name_ru": "Складская логистика", "name_en": "Warehouse logistics"},
            {"name_uz": "GPS va xarita integratsiya", "name_ru": "GPS интеграция", "name_en": "GPS integration"},
            {"name_uz": "Fleet management", "name_ru": "Управление автопарком", "name_en": "Fleet management"},
            {"name_uz": "Avtomatik xabarnoma", "name_ru": "Автоуведомления", "name_en": "Auto notifications"}
        ]
    }
]

# Create categories and subcategories
created_count = 0
for cat_data in categories_data:
    subcategories = cat_data.pop('subcategories')

    print(f"Creating category: {cat_data['name_uz']} {cat_data['icon']}")
    response = requests.post(
        f"{BASE_URL}/project-categories/",
        json=cat_data,
        headers=headers
    )

    if response.status_code == 201:
        category = response.json()
        print(f"  ✓ Created category ID: {category['id']}")
        created_count += 1

        # Create subcategories
        for i, subcat in enumerate(subcategories, 1):
            subcat['order'] = i
            response = requests.post(
                f"{BASE_URL}/project-categories/{category['id']}/subcategories",
                json=subcat,
                headers=headers
            )
            if response.status_code == 201:
                print(f"    ✓ {subcat['name_uz']}")
            else:
                print(f"    ✗ Failed: {subcat['name_uz']} - {response.text}")
    else:
        print(f"  ✗ Failed to create category: {response.text}")

print(f"\n{'='*60}")
print(f"✓ Successfully created {created_count} categories with subcategories!")
print(f"{'='*60}")
