"""
Test script to create sample projects and test the projects API
"""
import requests
import json
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
    print(f"✓ Logged in successfully")
    print(f"  Access token: {access_token[:20]}...")
else:
    print(f"✗ Login failed: {response.status_code}")
    print(f"  Response: {response.text}")
    exit(1)

# Create sample projects
sample_projects = [
    {
        "name_uz": "E-commerce API",
        "name_ru": "E-commerce API",
        "name_en": "E-commerce API",
        "description_uz": "To'liq funksional onlayn do'kon API",
        "description_ru": "Полнофункциональный API интернет-магазина",
        "description_en": "Full-featured online store API",
        "category": "Backend",
        "subcategory": "API",
        "technologies": ["Node.js", "MongoDB", "Express", "JWT"],
        "features": ["Product Management", "Cart System", "Payment Integration", "Order Tracking"],
        "integrations": ["Stripe", "PayPal", "Click", "Payme"],
        "color": "from-[#00a6a6] to-[#00a6a6]/80",
        "status": "active",
        "is_top": True,
        "is_new": True
    },
    {
        "name_uz": "CRM Dashboard",
        "name_ru": "CRM Панель",
        "name_en": "CRM Dashboard",
        "description_uz": "Mijozlarni boshqarish tizimi",
        "description_ru": "Система управления клиентами",
        "description_en": "Customer Relationship Management System",
        "category": "Frontend",
        "subcategory": "Dashboard",
        "technologies": ["React", "TypeScript", "TailwindCSS"],
        "features": ["Client Management", "Analytics", "Reports", "Team Collaboration"],
        "integrations": ["Google Analytics", "Mailchimp", "Slack"],
        "color": "from-[#0a2d5c] to-[#0a2d5c]/80",
        "status": "active",
        "is_top": True,
        "is_new": False
    },
    {
        "name_uz": "Mobil Bank Ilovasi",
        "name_ru": "Мобильное Банковское Приложение",
        "name_en": "Mobile Banking App",
        "description_uz": "Mobil bank ilovasi barcha asosiy funksiyalar bilan",
        "description_ru": "Мобильное банковское приложение со всеми основными функциями",
        "description_en": "Mobile banking application with all core features",
        "category": "Mobile",
        "subcategory": "Finance",
        "technologies": ["Flutter", "Firebase", "Dart"],
        "features": ["Money Transfer", "Bill Payment", "Cards Management", "Loan Applications"],
        "integrations": ["Uzcard", "Humo", "Visa", "Mastercard"],
        "color": "from-violet-500 to-purple-500",
        "status": "active",
        "is_top": False,
        "is_new": True
    },
    {
        "name_uz": "AI Chatbot",
        "name_ru": "AI Чатбот",
        "name_en": "AI Chatbot",
        "description_uz": "Sun'iy intellekt asosidagi chatbot",
        "description_ru": "Чатбот на основе искусственного интеллекта",
        "description_en": "Artificial Intelligence powered chatbot",
        "category": "AI/ML",
        "subcategory": "Chatbot",
        "technologies": ["Python", "TensorFlow", "FastAPI", "NLP"],
        "features": ["Natural Language Processing", "Multi-language Support", "Learning Capability", "Analytics"],
        "integrations": ["Telegram", "WhatsApp", "Facebook Messenger"],
        "color": "from-pink-500 to-rose-500",
        "status": "inactive",
        "is_top": False,
        "is_new": False
    }
]

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

print("\nCreating sample projects...")
created_count = 0
for project in sample_projects:
    response = requests.post(f"{BASE_URL}/projects/", json=project, headers=headers)
    if response.status_code == 201:
        created_project = response.json()
        print(f"✓ Created: {created_project['name_uz']} (ID: {created_project['id']})")
        created_count += 1
    else:
        print(f"✗ Failed to create {project['name_uz']}: {response.status_code}")
        print(f"  Response: {response.text}")

print(f"\nCreated {created_count}/{len(sample_projects)} projects")

# List all projects
print("\nFetching all projects...")
response = requests.get(f"{BASE_URL}/projects/")
if response.status_code == 200:
    projects = response.json()
    print(f"✓ Found {len(projects)} projects")
    for p in projects:
        print(f"  - {p['name_uz']} ({p['category']}) - {p['status']}")
else:
    print(f"✗ Failed to fetch projects: {response.status_code}")
    print(f"  Response: {response.text}")
