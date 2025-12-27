from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies import get_current_admin
from app.models import User, AIFeature
from app.schemas import AIFeatureCreate, AIFeatureUpdate, AIFeatureResponse

router = APIRouter(prefix="/ai-features", tags=["ai-features"])


@router.get("/public", response_model=List[AIFeatureResponse])
async def get_public_ai_features(
    db: Session = Depends(get_db)
):
    """Get all available AI features for public display."""
    features = db.query(AIFeature).filter(AIFeature.is_available == True).order_by(AIFeature.order).all()
    return features


@router.get("/", response_model=List[AIFeatureResponse])
async def get_all_ai_features(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all AI features (admin only)."""
    features = db.query(AIFeature).order_by(AIFeature.order, AIFeature.created_at.desc()).all()
    return features


@router.get("/categories")
async def get_ai_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all unique AI feature categories."""
    categories = db.query(AIFeature.category).distinct().all()
    return [c[0] for c in categories if c[0]]


@router.get("/{feature_id}", response_model=AIFeatureResponse)
async def get_ai_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get a single AI feature by ID."""
    feature = db.query(AIFeature).filter(AIFeature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="AI Feature not found")
    return feature


@router.post("/", response_model=AIFeatureResponse, status_code=status.HTTP_201_CREATED)
async def create_ai_feature(
    feature_data: AIFeatureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new AI feature."""
    feature = AIFeature(**feature_data.model_dump())
    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature


@router.put("/{feature_id}", response_model=AIFeatureResponse)
async def update_ai_feature(
    feature_id: int,
    feature_data: AIFeatureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update an AI feature."""
    feature = db.query(AIFeature).filter(AIFeature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="AI Feature not found")

    update_data = feature_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(feature, field, value)

    db.commit()
    db.refresh(feature)
    return feature


@router.delete("/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ai_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete an AI feature."""
    feature = db.query(AIFeature).filter(AIFeature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="AI Feature not found")

    db.delete(feature)
    db.commit()
    return None
