# Tezkor Boshlash Qo'llanmasi

## 1-qadam: Dependencies o'rnatish ✅

```bash
cd frontend
npm install
```

## 2-qadam: Environment Variables

`.env.local` fayli allaqachon yaratilgan. Agar kerak bo'lsa, uni tekshiring:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 3-qadam: Backend server ishga tushirish

Yangi terminal oynasida:

```bash
cd backend
# Virtual environment faollashtirish (Windows)
venv\Scripts\activate

# Server ishga tushirish
uvicorn app.main:app --reload
```

Backend `http://localhost:8000` da ishga tushadi.

## 4-qadam: Frontend server ishga tushirish

Frontend papkasida:

```bash
npm run dev
```

Frontend `http://localhost:3000` da ishga tushadi.

## 5-qadam: Brauzerda ochish

Brauzerda quyidagi manzilni oching:
```
http://localhost:3000
```

## Test qilish

1. **Register** - `/register` - Yangi foydalanuvchi yaratish
2. **Login** - `/login` - Tizimga kirish
3. **Marketplace** - `/marketplace` - Mahsulotlarni ko'rish
4. **Product Detail** - `/products/[id]` - Mahsulot tafsilotlari
5. **Orders** - `/orders` - Buyurtmalar (login qilgan holda)
6. **Seller** - `/seller` - Seller dashboard (seller roli bilan)
7. **Admin** - `/admin` - Admin panel (admin roli bilan)

## Muammolar

### Port band
```bash
# Boshqa portda ishga tushirish
npm run dev -- -p 3001
```

### Backend ulanmayapti
- Backend server ishlab turganligini tekshiring
- `http://localhost:8000/docs` ni ochib, API ishlayotganini tekshiring
- `.env.local` fayldagi URL to'g'ri ekanligini tekshiring

### Xatolar
```bash
# Cache tozalash
rm -rf .next
npm run dev
```


