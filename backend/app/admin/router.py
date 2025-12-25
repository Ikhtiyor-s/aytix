from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.dependencies import get_current_admin
from app.models import User, Product, Order, UserRole, ProductStatus
from app.schemas import ProductModeration, StatsResponse, ProductResponse, UserResponse, OrderResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=StatsResponse)
def get_stats(
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin statistics."""
    total_users = db.query(func.count(User.id)).scalar()
    total_sellers = db.query(func.count(User.id)).filter(User.role == UserRole.SELLER).scalar()
    total_products = db.query(func.count(Product.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    
    return {
        "total_users": total_users or 0,
        "total_sellers": total_sellers or 0,
        "total_products": total_products or 0,
        "total_orders": total_orders or 0
    }


@router.get("/products/pending", response_model=list[ProductResponse])
def list_pending_products(
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List products pending moderation."""
    products = db.query(Product).filter(Product.status == ProductStatus.PENDING).order_by(Product.created_at.desc()).all()
    return products


@router.post("/products/{product_id}/moderate", response_model=ProductResponse)
def moderate_product(
    product_id: int,
    moderation: ProductModeration,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Approve or reject a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product.status = moderation.status
    db.commit()
    db.refresh(product)
    return product


@router.get("/users", response_model=list[UserResponse])
def list_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all users."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/orders", response_model=list[OrderResponse])
def list_all_orders(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all orders."""
    orders = db.query(Order).offset(skip).limit(limit).order_by(Order.created_at.desc()).all()
    return orders



