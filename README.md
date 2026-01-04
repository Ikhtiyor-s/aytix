# Marketplace - Full-Stack Application

A production-ready marketplace application with backend (FastAPI) and frontend (Next.js) fully integrated.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Authentication**: JWT (access + refresh tokens)
- **Roles**: user, seller, admin
- **Payment**: Stub only (no real payment integration)

## Project Structure

```
/backend
  /app
    /core (config, security, database)
    /auth (login, register, refresh, roles)
    /users
    /products
    /categories
    /orders
    /admin
    /stats
    main.py
    dependencies.py
    schemas.py
    models.py
  requirements.txt

/frontend
  /app
    /(public)
    /(auth)
    /(marketplace)
    /admin
  /services (API client)
  /components
  /hooks
  middleware.ts
  next.config.js
```

## Features

### Backend
- User registration and login
- JWT authentication with access and refresh tokens
- Role-based access control (user, seller, admin)
- Seller product CRUD operations
- Product moderation (admin approve/reject)
- Product listing for marketplace (only approved products)
- Orders (create, list)
- Admin statistics dashboard
- Pagination and filtering
- OpenAPI documentation at `/docs`

### Frontend
- Marketplace page with product listing
- Product details page
- Authentication pages (login/register)
- Seller dashboard (manage products)
- Admin panel:
  - Dashboard with statistics
  - Product moderation
- Protected routes by role
- API fully connected to backend

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 12+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a PostgreSQL database:
```sql
CREATE DATABASE marketplace;
```

6. Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketplace
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["http://localhost:3000"]
```

7. Run the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### Creating an Admin User

To create an admin user, you can use the API directly or modify the database:

1. Register a user through the frontend or API
2. Update the user role in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### User Roles

- **User**: Can browse products and create orders
- **Seller**: Can create and manage products (products need admin approval)
- **Admin**: Can moderate products, view statistics, and manage users

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token

#### Products
- `GET /api/v1/products` - List products (with pagination and filtering)
- `GET /api/v1/products/{id}` - Get product details
- `GET /api/v1/products/my-products` - Get seller's products (seller only)
- `POST /api/v1/products` - Create product (seller only)
- `PUT /api/v1/products/{id}` - Update product (seller only)
- `DELETE /api/v1/products/{id}` - Delete product (seller only)

#### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List user's orders
- `GET /api/v1/orders/{id}` - Get order details

#### Admin
- `GET /api/v1/admin/stats` - Get statistics (admin only)
- `GET /api/v1/admin/products/pending` - Get pending products (admin only)
- `POST /api/v1/admin/products/{id}/moderate` - Moderate product (admin only)

## Development

### Backend Development

The backend uses FastAPI with SQLAlchemy. Database migrations are handled automatically on startup (for development). For production, use Alembic for migrations.

### Frontend Development

The frontend uses Next.js 14 with App Router. The API client is configured in `services/api.ts` with automatic token refresh.

## Production Deployment

### Backend

1. Set proper environment variables
2. Use a production ASGI server like Gunicorn with Uvicorn workers
3. Set up proper database migrations with Alembic
4. Configure CORS origins for your frontend domain
5. Use a strong SECRET_KEY

### Frontend

1. Set `NEXT_PUBLIC_API_URL` to your backend API URL
2. Build the application: `npm run build`
3. Run the production server: `npm start`

## License

This project is provided as-is for educational and development purposes.



