from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, OrderStatus, ProductStatus, ProjectStatus, ContentStatus, TargetAudience


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    image_url: Optional[str] = None
    category_id: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    seller_id: int
    status: ProductStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    seller: Optional[UserResponse] = None
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]


class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    total_amount: float
    status: OrderStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    buyer: Optional[UserResponse] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# Admin Schemas
class ProductModeration(BaseModel):
    status: ProductStatus


class StatsResponse(BaseModel):
    total_users: int
    total_sellers: int
    total_products: int
    total_orders: int


# Pagination
class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    pages: int


# Project Schemas
class ProjectBase(BaseModel):
    name_uz: str
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    description_uz: str
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    technologies: Optional[List[str]] = []
    features: Optional[List[str]] = []
    integrations: Optional[List[str]] = []
    color: Optional[str] = "from-primary-500 to-primary-600"
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    images: Optional[List[str]] = []
    status: Optional[ProjectStatus] = ProjectStatus.ACTIVE
    is_top: Optional[bool] = False
    is_new: Optional[bool] = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name_uz: Optional[str] = None
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    description_uz: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    technologies: Optional[List[str]] = None
    features: Optional[List[str]] = None
    integrations: Optional[List[str]] = None
    color: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[ProjectStatus] = None
    is_top: Optional[bool] = None
    is_new: Optional[bool] = None


class ProjectResponse(ProjectBase):
    id: int
    views: int
    favorites: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# CategoryProject Schemas
class CategoryProjectBase(BaseModel):
    name_uz: str
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    description_uz: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = 0
    is_active: Optional[bool] = True


class CategoryProjectCreate(CategoryProjectBase):
    pass


class CategoryProjectUpdate(BaseModel):
    name_uz: Optional[str] = None
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    description_uz: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class SubcategoryProjectResponse(BaseModel):
    id: int
    name_uz: str
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    category_id: int  # This stays for response
    order: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CategoryProjectResponse(CategoryProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# SubcategoryProject Schemas
class SubcategoryProjectBase(BaseModel):
    name_uz: str
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    order: Optional[int] = 0
    is_active: Optional[bool] = True


class SubcategoryProjectCreate(SubcategoryProjectBase):
    # category_id will be set from URL path parameter
    pass


class SubcategoryProjectUpdate(BaseModel):
    name_uz: Optional[str] = None
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    category_id: Optional[int] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


# News Schemas
class NewsBase(BaseModel):
    title_uz: str
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    content_uz: str
    content_ru: Optional[str] = None
    content_en: Optional[str] = None
    image_url: Optional[str] = None
    target: Optional[TargetAudience] = TargetAudience.ALL
    status: Optional[ContentStatus] = ContentStatus.ACTIVE


class NewsCreate(NewsBase):
    pass


class NewsUpdate(BaseModel):
    title_uz: Optional[str] = None
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    content_uz: Optional[str] = None
    content_ru: Optional[str] = None
    content_en: Optional[str] = None
    image_url: Optional[str] = None
    target: Optional[TargetAudience] = None
    status: Optional[ContentStatus] = None


class NewsResponse(NewsBase):
    id: int
    views: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Banner Schemas
class BannerBase(BaseModel):
    title_uz: str
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    description_uz: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    project_id: Optional[int] = None
    order: Optional[int] = 0
    status: Optional[ContentStatus] = ContentStatus.ACTIVE


class BannerCreate(BannerBase):
    pass


class BannerUpdate(BaseModel):
    title_uz: Optional[str] = None
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    description_uz: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    project_id: Optional[int] = None
    order: Optional[int] = None
    status: Optional[ContentStatus] = None


class BannerResponse(BannerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    title_uz: str
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    message_uz: Optional[str] = None
    message_ru: Optional[str] = None
    message_en: Optional[str] = None
    icon: Optional[str] = None
    target: Optional[TargetAudience] = TargetAudience.ALL
    scheduled_at: Optional[datetime] = None
    status: Optional[ContentStatus] = ContentStatus.ACTIVE


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    title_uz: Optional[str] = None
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    message_uz: Optional[str] = None
    message_ru: Optional[str] = None
    message_en: Optional[str] = None
    icon: Optional[str] = None
    target: Optional[TargetAudience] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[ContentStatus] = None


class NotificationResponse(NotificationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True



