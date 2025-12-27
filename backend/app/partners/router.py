from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies import get_current_admin
from app.models import User, Partner, PartnerStatus
from app.schemas import PartnerCreate, PartnerUpdate, PartnerResponse

router = APIRouter(prefix="/partners", tags=["partners"])


@router.get("/public", response_model=List[PartnerResponse])
async def get_public_partners(
    db: Session = Depends(get_db)
):
    """Get all active partners for public display."""
    partners = db.query(Partner).filter(Partner.status == PartnerStatus.ACTIVE).order_by(Partner.order).all()
    return partners


@router.get("/", response_model=List[PartnerResponse])
async def get_all_partners(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all partners (admin only)."""
    partners = db.query(Partner).order_by(Partner.order, Partner.created_at.desc()).all()
    return partners


@router.get("/{partner_id}", response_model=PartnerResponse)
async def get_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get a single partner by ID."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner


@router.post("/", response_model=PartnerResponse, status_code=status.HTTP_201_CREATED)
async def create_partner(
    partner_data: PartnerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new partner."""
    partner = Partner(**partner_data.model_dump())
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.put("/{partner_id}", response_model=PartnerResponse)
async def update_partner(
    partner_id: int,
    partner_data: PartnerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a partner."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    update_data = partner_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(partner, field, value)

    db.commit()
    db.refresh(partner)
    return partner


@router.delete("/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a partner."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    db.delete(partner)
    db.commit()
    return None
