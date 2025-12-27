from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.dependencies import get_current_user, get_current_admin
from app.models import CategoryProject, SubcategoryProject, User
from app.schemas import (
    CategoryProjectCreate,
    CategoryProjectUpdate,
    CategoryProjectResponse,
    SubcategoryProjectCreate,
    SubcategoryProjectUpdate,
    SubcategoryProjectResponse
)

router = APIRouter(prefix="/project-categories", tags=["project-categories"])


# Category CRUD operations
@router.get("/", response_model=List[CategoryProjectResponse])
def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List all project categories."""
    query = db.query(CategoryProject)

    if is_active is not None:
        query = query.filter(CategoryProject.is_active == is_active)

    query = query.order_by(CategoryProject.order, CategoryProject.created_at)
    categories = query.offset(skip).limit(limit).all()
    return categories


@router.get("/{category_id}", response_model=CategoryProjectResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific category by ID."""
    category = db.query(CategoryProject).filter(CategoryProject.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.post("/", response_model=CategoryProjectResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryProjectCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new project category (admin only)."""
    category = CategoryProject(**category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryProjectResponse)
def update_category(
    category_id: int,
    category_data: CategoryProjectUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a project category (admin only)."""
    category = db.query(CategoryProject).filter(CategoryProject.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a project category (admin only)."""
    category = db.query(CategoryProject).filter(CategoryProject.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    db.delete(category)
    db.commit()
    return None


# Subcategory CRUD operations
@router.get("/{category_id}/subcategories", response_model=List[SubcategoryProjectResponse])
def list_subcategories(
    category_id: int,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List all subcategories for a specific category."""
    # Check if category exists
    category = db.query(CategoryProject).filter(CategoryProject.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    query = db.query(SubcategoryProject).filter(SubcategoryProject.category_id == category_id)

    if is_active is not None:
        query = query.filter(SubcategoryProject.is_active == is_active)

    query = query.order_by(SubcategoryProject.order, SubcategoryProject.created_at)
    subcategories = query.all()
    return subcategories


@router.post("/{category_id}/subcategories", response_model=SubcategoryProjectResponse, status_code=status.HTTP_201_CREATED)
def create_subcategory(
    category_id: int,
    subcategory_data: SubcategoryProjectCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new subcategory for a category (admin only)."""
    # Check if category exists
    category = db.query(CategoryProject).filter(CategoryProject.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Ensure category_id matches
    subcategory_dict = subcategory_data.model_dump()
    subcategory_dict['category_id'] = category_id

    subcategory = SubcategoryProject(**subcategory_dict)
    db.add(subcategory)
    db.commit()
    db.refresh(subcategory)
    return subcategory


@router.put("/subcategories/{subcategory_id}", response_model=SubcategoryProjectResponse)
def update_subcategory(
    subcategory_id: int,
    subcategory_data: SubcategoryProjectUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a subcategory (admin only)."""
    subcategory = db.query(SubcategoryProject).filter(SubcategoryProject.id == subcategory_id).first()
    if not subcategory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")

    update_data = subcategory_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subcategory, field, value)

    db.commit()
    db.refresh(subcategory)
    return subcategory


@router.delete("/subcategories/{subcategory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subcategory(
    subcategory_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a subcategory (admin only)."""
    subcategory = db.query(SubcategoryProject).filter(SubcategoryProject.id == subcategory_id).first()
    if not subcategory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")

    db.delete(subcategory)
    db.commit()
    return None
