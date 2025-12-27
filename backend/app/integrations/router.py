from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies import get_current_admin
from app.models import User, Integration, IntegrationStatus
from app.schemas import IntegrationCreate, IntegrationUpdate, IntegrationResponse

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/public", response_model=List[IntegrationResponse])
async def get_public_integrations(
    db: Session = Depends(get_db)
):
    """Get all active integrations for public display."""
    integrations = db.query(Integration).filter(Integration.status != IntegrationStatus.INACTIVE).all()
    return integrations


@router.get("/", response_model=List[IntegrationResponse])
async def get_all_integrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all integrations (admin only)."""
    integrations = db.query(Integration).order_by(Integration.category, Integration.created_at.desc()).all()
    return integrations


@router.get("/categories")
async def get_integration_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all unique integration categories."""
    categories = db.query(Integration.category).distinct().all()
    return [c[0] for c in categories if c[0]]


@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get a single integration by ID."""
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration


@router.post("/", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED)
async def create_integration(
    integration_data: IntegrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new integration."""
    integration = Integration(**integration_data.model_dump())
    db.add(integration)
    db.commit()
    db.refresh(integration)
    return integration


@router.put("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    integration_id: int,
    integration_data: IntegrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update an integration."""
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    update_data = integration_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(integration, field, value)

    db.commit()
    db.refresh(integration)
    return integration


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete an integration."""
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    db.delete(integration)
    db.commit()
    return None
