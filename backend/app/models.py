from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum as SQLEnum, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    SELLER = "seller"
    ADMIN = "admin"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class ProductStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class ContentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class TargetAudience(str, enum.Enum):
    ALL = "all"
    USERS = "users"
    SELLERS = "sellers"
    ADMINS = "admins"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    products = relationship("Product", back_populates="seller")
    orders = relationship("Order", back_populates="buyer")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    products = relationship("Product", back_populates="category")


class CategoryProject(Base):
    """Categories for Projects (Dasturlar va Xizmatlar)"""
    __tablename__ = "category_projects"

    id = Column(Integer, primary_key=True, index=True)

    # Multilingual fields
    name_uz = Column(String, nullable=False, index=True)
    name_ru = Column(String, nullable=True)
    name_en = Column(String, nullable=True)

    description_uz = Column(Text, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)

    # Icon/emoji for category
    icon = Column(String, nullable=True)

    # Ordering
    order = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SubcategoryProject(Base):
    """Subcategories for Project Categories"""
    __tablename__ = "subcategory_projects"

    id = Column(Integer, primary_key=True, index=True)

    # Multilingual fields
    name_uz = Column(String, nullable=False)
    name_ru = Column(String, nullable=True)
    name_en = Column(String, nullable=True)

    # Foreign key
    category_id = Column(Integer, ForeignKey("category_projects.id", ondelete="CASCADE"), nullable=False)

    # Ordering
    order = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    image_url = Column(String, nullable=True)
    status = Column(SQLEnum(ProductStatus), default=ProductStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign keys
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    # Relationships
    seller = relationship("User", back_populates="products")
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign keys
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    buyer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    # Foreign keys
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    # Multilingual fields
    name_uz = Column(String, nullable=False)
    name_ru = Column(String, nullable=True)
    name_en = Column(String, nullable=True)

    description_uz = Column(Text, nullable=False)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)

    # Project details
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String, nullable=True)
    technologies = Column(JSON, nullable=True)  # Array of technologies
    features = Column(JSON, nullable=True)  # Array of features
    integrations = Column(JSON, nullable=True)  # Array of integrations

    # Visual
    color = Column(String, default="from-primary-500 to-primary-600")
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    images = Column(JSON, nullable=True)  # Array of additional image URLs

    # Stats
    views = Column(Integer, default=0)
    favorites = Column(Integer, default=0)

    # Status
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.ACTIVE, nullable=False)
    is_top = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class News(Base):
    """Yangiliklar - News/Articles"""
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)

    # Multilingual title
    title_uz = Column(String, nullable=False)
    title_ru = Column(String, nullable=True)
    title_en = Column(String, nullable=True)

    # Multilingual content
    content_uz = Column(Text, nullable=False)
    content_ru = Column(Text, nullable=True)
    content_en = Column(Text, nullable=True)

    # Image
    image_url = Column(String, nullable=True)

    # Target audience
    target = Column(SQLEnum(TargetAudience), default=TargetAudience.ALL)

    # Stats
    views = Column(Integer, default=0)

    # Status
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.ACTIVE)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Banner(Base):
    """Bannerlar - Promotional banners"""
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)

    # Multilingual title
    title_uz = Column(String, nullable=False)
    title_ru = Column(String, nullable=True)
    title_en = Column(String, nullable=True)

    # Multilingual description
    description_uz = Column(Text, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)

    # Image
    image_url = Column(String, nullable=True)

    # Link
    link_url = Column(String, nullable=True)

    # Project ID for linking to a project
    project_id = Column(Integer, nullable=True)

    # Order/priority
    order = Column(Integer, default=0)

    # Status
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.ACTIVE)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Notification(Base):
    """Xabarnomalar - Push notifications"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # Multilingual title
    title_uz = Column(String, nullable=False)
    title_ru = Column(String, nullable=True)
    title_en = Column(String, nullable=True)

    # Multilingual message
    message_uz = Column(Text, nullable=True)
    message_ru = Column(Text, nullable=True)
    message_en = Column(Text, nullable=True)

    # Icon
    icon = Column(String, nullable=True)

    # Target audience
    target = Column(SQLEnum(TargetAudience), default=TargetAudience.ALL)

    # Schedule date
    scheduled_at = Column(DateTime(timezone=True), nullable=True)

    # Status
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.ACTIVE)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


