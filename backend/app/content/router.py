from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies import get_current_admin
from app.models import User, News, Banner, Notification
from app.schemas import (
    NewsCreate, NewsUpdate, NewsResponse,
    BannerCreate, BannerUpdate, BannerResponse,
    NotificationCreate, NotificationUpdate, NotificationResponse
)

router = APIRouter(prefix="/content", tags=["content"])


# ============ NEWS ENDPOINTS ============

@router.get("/news", response_model=List[NewsResponse])
async def get_all_news(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all news articles."""
    news = db.query(News).order_by(News.created_at.desc()).all()
    return news


@router.get("/news/{news_id}", response_model=NewsResponse)
async def get_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get a single news article by ID."""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    return news


@router.post("/news", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    news_data: NewsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new news article."""
    news = News(**news_data.model_dump())
    db.add(news)
    db.commit()
    db.refresh(news)
    return news


@router.put("/news/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: int,
    news_data: NewsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a news article."""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    update_data = news_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(news, field, value)

    db.commit()
    db.refresh(news)
    return news


@router.delete("/news/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a news article."""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    db.delete(news)
    db.commit()
    return None


# ============ BANNER ENDPOINTS ============

@router.get("/banners", response_model=List[BannerResponse])
async def get_all_banners(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all banners."""
    banners = db.query(Banner).order_by(Banner.order, Banner.created_at.desc()).all()
    return banners


@router.get("/banners/{banner_id}", response_model=BannerResponse)
async def get_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get a single banner by ID."""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    return banner


@router.post("/banners", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
async def create_banner(
    banner_data: BannerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new banner."""
    banner = Banner(**banner_data.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@router.put("/banners/{banner_id}", response_model=BannerResponse)
async def update_banner(
    banner_id: int,
    banner_data: BannerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a banner."""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    update_data = banner_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(banner, field, value)

    db.commit()
    db.refresh(banner)
    return banner


@router.delete("/banners/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a banner."""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    db.delete(banner)
    db.commit()
    return None


# ============ NOTIFICATION ENDPOINTS ============

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all notifications."""
    notifications = db.query(Notification).order_by(Notification.created_at.desc()).all()
    return notifications


@router.get("/notifications/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get a single notification by ID."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new notification."""
    notification = Notification(**notification_data.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/notifications/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a notification."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    update_data = notification_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notification, field, value)

    db.commit()
    db.refresh(notification)
    return notification


@router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a notification."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return None
