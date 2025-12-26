from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.dependencies import get_current_user, get_current_admin
from app.models import Project, User, ProjectStatus
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[ProjectStatus] = None,
    is_top: Optional[bool] = None,
    is_new: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all projects with filtering and pagination."""
    query = db.query(Project)

    # Apply filters
    if category:
        query = query.filter(Project.category == category)
    if status:
        query = query.filter(Project.status == status)
    if is_top is not None:
        query = query.filter(Project.is_top == is_top)
    if is_new is not None:
        query = query.filter(Project.is_new == is_new)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Project.name_uz.ilike(search_filter)) |
            (Project.name_ru.ilike(search_filter)) |
            (Project.name_en.ilike(search_filter)) |
            (Project.description_uz.ilike(search_filter)) |
            (Project.description_ru.ilike(search_filter)) |
            (Project.description_en.ilike(search_filter))
        )

    # Order by created_at descending
    query = query.order_by(Project.created_at.desc())

    # Apply pagination
    projects = query.offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Get a single project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Increment view count
    project.views += 1
    db.commit()
    db.refresh(project)

    return project


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new project (admin only)."""
    project = Project(
        name_uz=project_data.name_uz,
        name_ru=project_data.name_ru,
        name_en=project_data.name_en,
        description_uz=project_data.description_uz,
        description_ru=project_data.description_ru,
        description_en=project_data.description_en,
        category=project_data.category,
        subcategory=project_data.subcategory,
        technologies=project_data.technologies,
        features=project_data.features,
        integrations=project_data.integrations,
        color=project_data.color,
        image_url=project_data.image_url,
        video_url=project_data.video_url,
        images=project_data.images,
        status=project_data.status,
        is_top=project_data.is_top,
        is_new=project_data.is_new
    )

    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a project (admin only)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Update only provided fields
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a project (admin only)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()
    return None


@router.post("/{project_id}/favorite", response_model=ProjectResponse)
def toggle_favorite(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle favorite status for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # TODO: Implement user favorites table
    # For now, just increment/decrement the counter
    project.favorites += 1
    db.commit()
    db.refresh(project)

    return project
