from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.products.router import router as products_router
from app.categories.router import router as categories_router
from app.categories.project_router import router as project_categories_router
from app.orders.router import router as orders_router
from app.admin.router import router as admin_router
from app.stats.router import router as stats_router
from app.projects.router import router as projects_router
from app.uploads.router import router as uploads_router
from app.content.router import router as content_router
from app.messages.router import router as messages_router
from app.partners.router import router as partners_router
from app.integrations.router import router as integrations_router
from app.ai_features.router import router as ai_features_router
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A full-stack marketplace API with Projects",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(products_router, prefix=settings.API_V1_PREFIX)
app.include_router(categories_router, prefix=settings.API_V1_PREFIX)
app.include_router(project_categories_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(stats_router, prefix=settings.API_V1_PREFIX)
app.include_router(projects_router, prefix=settings.API_V1_PREFIX)
app.include_router(uploads_router, prefix=settings.API_V1_PREFIX)
app.include_router(content_router, prefix=settings.API_V1_PREFIX)
app.include_router(messages_router, prefix=settings.API_V1_PREFIX)
app.include_router(partners_router, prefix=settings.API_V1_PREFIX)
app.include_router(integrations_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_features_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {"message": "Marketplace API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}

# Trigger reload v2



