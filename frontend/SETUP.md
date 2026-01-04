# Frontend Lokalda Ishlatish Qo'llanmasi

## Talablar

- Node.js 18+ o'rnatilgan bo'lishi kerak
- npm yoki yarn package manager
- Backend server ishlab turishi kerak (http://localhost:8000)

## Qadamlar

### 1. Dependencies o'rnatish

```bash
cd frontend
npm install
```

### 2. Environment Variables sozlash

`.env.local` fayli allaqachon yaratilgan. Agar backend boshqa portda ishlayotgan bo'lsa, uni o'zgartiring:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Development server ishga tushirish

```bash
npm run dev
```

Server `http://localhost:3000` da ishga tushadi.

### 4. Browserda ochish

Brauzerda quyidagi manzilni oching:
```
http://localhost:3000
```

## Foydalanish

1. **Register** - Yangi foydalanuvchi ro'yxatdan o'tkazish
2. **Login** - Tizimga kirish
3. **Marketplace** - Mahsulotlarni ko'rish va qidirish
4. **Products** - Mahsulot tafsilotlarini ko'rish
5. **Orders** - Buyurtmalarni ko'rish
6. **Seller Dashboard** - Seller bo'lsangiz, mahsulotlarni boshqarish
7. **Admin Panel** - Admin bo'lsangiz, tizimni boshqarish

## Muammolarni hal qilish

### Port allaqachon band
Agar 3000 port band bo'lsa:
```bash
npm run dev -- -p 3001
```

### Backend ulanmayapti
- Backend server ishlab turganligini tekshiring
- `.env.local` fayldagi `NEXT_PUBLIC_API_URL` to'g'ri ekanligini tekshiring
- CORS sozlamalarini tekshiring

### Dependencies xatolari
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production build

```bash
npm run build
npm start
```


