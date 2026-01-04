# Marketplace Frontend

Next.js 14 bilan yozilgan to'liq funksional marketplace frontend ilovasi.

## Struktura

```
frontend/
├── app/                    # Next.js App Router sahifalar
│   ├── (auth)/            # Autentifikatsiya sahifalari
│   │   ├── login/
│   │   └── register/
│   ├── (marketplace)/     # Marketplace sahifalari
│   │   ├── marketplace/
│   │   ├── orders/
│   │   └── products/[id]/
│   ├── admin/             # Admin panel
│   ├── seller/            # Seller dashboard
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
│
├── components/            # React komponentlar
│   ├── ui/               # Reusable UI komponentlar
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Loading.tsx
│   │   ├── Error.tsx
│   │   └── Modal.tsx
│   ├── Navbar.tsx        # Navigation bar
│   ├── ProductCard.tsx   # Product card komponenti
│   └── OrderCard.tsx     # Order card komponenti
│
├── services/             # API servislar
│   ├── api.ts           # Axios konfiguratsiyasi
│   ├── auth.ts          # Autentifikatsiya servislari
│   ├── products.ts      # Product servislari
│   ├── orders.ts        # Order servislari
│   ├── categories.ts    # Category servislari
│   └── admin.ts         # Admin servislari
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   ├── useDebounce.ts  # Debounce hook
│   ├── useLocalStorage.ts  # LocalStorage hook
│   └── usePagination.ts    # Pagination hook
│
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Auth context
│
├── utils/              # Utility funksiyalar
│   ├── formatters.ts   # Formatlash funksiyalari
│   ├── validators.ts   # Validatsiya funksiyalari
│   └── helpers.ts      # Helper funksiyalar
│
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
│
├── lib/                # Library konfiguratsiyalar
│   └── constants.ts    # Application constants
│
├── middleware.ts       # Next.js middleware
├── next.config.js      # Next.js konfiguratsiyasi
├── tailwind.config.js  # Tailwind CSS konfiguratsiyasi
├── tsconfig.json       # TypeScript konfiguratsiyasi
└── package.json        # Dependencies
```

## O'rnatish

```bash
# Dependencies o'rnatish
npm install

# Development server ishga tushirish
npm run dev

# Production build
npm run build

# Production server
npm start
```

## Environment Variables

`.env.local` fayl yarating va quyidagilarni qo'shing:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Marketplace
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Asosiy Xususiyatlar

- ✅ User autentifikatsiyasi (login/register)
- ✅ Product browsing va qidiruv
- ✅ Category filtrlash
- ✅ Order yaratish va ko'rish
- ✅ Seller dashboard (product CRUD)
- ✅ Admin panel (product moderation, stats)
- ✅ Responsive dizayn
- ✅ TypeScript to'liq qo'llab-quvvatlash
- ✅ Error handling va loading states

## Komponentlar

### UI Komponentlar

- **Button**: Variantlar (primary, secondary, danger, success, outline)
- **Input**: Label va error handling bilan
- **Textarea**: Label va error handling bilan
- **Loading**: Spinner komponenti
- **Error**: Error message komponenti
- **Modal**: Modal dialog komponenti

### Business Komponentlar

- **ProductCard**: Product ko'rsatish uchun card
- **OrderCard**: Order ko'rsatish uchun card
- **Navbar**: Navigation bar

## Hooks

- **useAuth**: Authentication state management
- **useDebounce**: Debounce values
- **useLocalStorage**: LocalStorage bilan ishlash
- **usePagination**: Pagination logic

## Utilities

- **formatters**: formatPrice, formatDate, formatDateTime, formatRelativeTime
- **validators**: isValidEmail, isValidPassword, isValidUrl
- **helpers**: getOrderStatusColor, getProductStatusColor, debounce, throttle

## API Servislar

Barcha API chaqiruvlari `services/` papkasida tashkil etilgan:
- `auth.ts`: Login, register, logout
- `products.ts`: Product CRUD operatsiyalari
- `orders.ts`: Order yaratish va olish
- `categories.ts`: Category olish
- `admin.ts`: Admin operatsiyalari

## Routing

Next.js App Router ishlatilgan:
- `/` - Home (redirects to /marketplace)
- `/login` - Login page
- `/register` - Register page
- `/marketplace` - Product listing
- `/products/[id]` - Product detail
- `/orders` - User orders
- `/seller` - Seller dashboard
- `/admin` - Admin panel

## Styling

Tailwind CSS ishlatilgan responsive dizayn uchun.

## TypeScript

To'liq TypeScript qo'llab-quvvatlash. Barcha types `types/index.ts` da markazlashtirilgan.


