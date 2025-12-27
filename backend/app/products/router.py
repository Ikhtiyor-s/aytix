from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.core.database import get_db
from app.dependencies import get_current_user, get_current_active_seller, get_current_admin
from app.models import Product, ProductStatus, Category
from app.schemas import ProductCreate, ProductUpdate, ProductResponse, PaginatedResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=PaginatedResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List products (only approved products for public, all for admin)."""
    query = db.query(Product)
    
    # Only show approved products for non-admin users
    # In a real app, you'd check current_user role here
    query = query.filter(Product.status == ProductStatus.APPROVED)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
        )
    
    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": products,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }


@router.get("/my-products", response_model=List[ProductResponse])
def list_my_products(
    current_user = Depends(get_current_active_seller),
    db: Session = Depends(get_db)
):
    """List current seller's products."""
    products = db.query(Product).filter(Product.seller_id == current_user.id).order_by(Product.created_at.desc()).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    current_user = Depends(get_current_active_seller),
    db: Session = Depends(get_db)
):
    """Create a new product."""
    # Verify category exists if provided
    if product_data.category_id:
        category = db.query(Category).filter(Category.id == product_data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    db_product = Product(
        **product_data.model_dump(),
        seller_id=current_user.id,
        status=ProductStatus.PENDING
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user = Depends(get_current_active_seller),
    db: Session = Depends(get_db)
):
    """Update a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership (unless admin)
    if product.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Verify category exists if being updated
    if product_update.category_id:
        category = db.query(Category).filter(Category.id == product_update.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    # Reset status to pending if product is updated (unless admin)
    if current_user.role != "admin":
        product.status = ProductStatus.PENDING
    
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user = Depends(get_current_active_seller),
    db: Session = Depends(get_db)
):
    """Delete a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership (unless admin)
    if product.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(product)
    db.commit()
    return None



