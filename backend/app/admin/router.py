from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.dependencies import get_current_admin
from app.models import User, Product, Order, UserRole, ProductStatus, Project, Message, MessageStatus, Partner, Integration, News, Banner
from app.schemas import ProductResponse, ProductModeration, UserResponse, OrderResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_stats(
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin statistics."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_sellers = db.query(func.count(User.id)).filter(User.role == UserRole.SELLER).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0

    return {
        "total_users": total_users,
        "total_sellers": total_sellers,
        "total_products": total_products,
        "total_orders": total_orders
    }


@router.get("/dashboard-stats")
def get_dashboard_stats(
    period: str = "weekly",
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics."""
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
    this_week_start = now - timedelta(days=7)
    last_week_start = now - timedelta(days=14)

    # Users stats
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    new_users_this_month = db.query(func.count(User.id)).filter(User.created_at >= this_month_start).scalar() or 0
    new_users_last_month = db.query(func.count(User.id)).filter(
        User.created_at >= last_month_start,
        User.created_at < this_month_start
    ).scalar() or 0
    new_users_this_week = db.query(func.count(User.id)).filter(User.created_at >= this_week_start).scalar() or 0

    # Projects stats
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    total_project_views = db.query(func.sum(Project.views)).scalar() or 0
    projects_this_month = db.query(func.count(Project.id)).filter(Project.created_at >= this_month_start).scalar() or 0
    projects_last_month = db.query(func.count(Project.id)).filter(
        Project.created_at >= last_month_start,
        Project.created_at < this_month_start
    ).scalar() or 0

    # Messages stats
    total_messages = db.query(func.count(Message.id)).scalar() or 0
    new_messages = db.query(func.count(Message.id)).filter(Message.status == MessageStatus.NEW).scalar() or 0

    # Partners & Integrations
    total_partners = db.query(func.count(Partner.id)).scalar() or 0
    total_integrations = db.query(func.count(Integration.id)).scalar() or 0

    # Content stats
    total_news = db.query(func.count(News.id)).scalar() or 0
    total_banners = db.query(func.count(Banner.id)).scalar() or 0

    # Calculate growth percentages
    def calc_growth(current, previous):
        if previous == 0:
            return 100 if current > 0 else 0
        return round(((current - previous) / previous) * 100, 1)

    users_growth = calc_growth(new_users_this_month, new_users_last_month)
    projects_growth = calc_growth(projects_this_month, projects_last_month)

    # Simulate additional stats for dashboard cards
    # Revenue (simulated based on messages/leads)
    total_revenue = total_messages * 150000  # 150k per lead
    revenue_growth = 12.5

    # Leads (messages are leads)
    total_leads = new_messages + (total_messages // 4)
    leads_growth = 8.3

    # Conversion rate
    conversion_rate = round((total_leads / max(total_project_views, 1)) * 100, 2) if total_project_views > 0 else 0
    conversion_growth = 3.2

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "new_this_month": new_users_this_month,
            "new_this_week": new_users_this_week,
            "growth": users_growth
        },
        "projects": {
            "total": total_projects,
            "views": total_project_views,
            "new_this_month": projects_this_month,
            "growth": projects_growth
        },
        "messages": {
            "total": total_messages,
            "new": new_messages
        },
        "revenue": {
            "total": total_revenue,
            "growth": revenue_growth
        },
        "leads": {
            "total": total_leads,
            "growth": leads_growth
        },
        "conversion": {
            "rate": conversion_rate,
            "growth": conversion_growth
        },
        "partners": total_partners,
        "integrations": total_integrations,
        "content": {
            "news": total_news,
            "banners": total_banners
        }
    }


@router.get("/analytics")
def get_analytics(
    period: str = "weekly",
    category: str = "all",
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics data with period filtering."""
    now = datetime.utcnow()

    # Period filtering
    if period == "daily":
        start_date = now - timedelta(days=1)
        period_label = "Kunlik"
    elif period == "weekly":
        start_date = now - timedelta(weeks=1)
        period_label = "Haftalik"
    elif period == "monthly":
        start_date = now - timedelta(days=30)
        period_label = "Oylik"
    elif period == "yearly":
        start_date = now - timedelta(days=365)
        period_label = "Yillik"
    else:
        start_date = now - timedelta(weeks=1)
        period_label = "Haftalik"

    # Get data for the last 12 months
    months_data = []
    for i in range(11, -1, -1):
        month_date = now - timedelta(days=i * 30)
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i > 0:
            next_month = (month_start + timedelta(days=32)).replace(day=1)
        else:
            next_month = now + timedelta(days=1)

        users_count = db.query(func.count(User.id)).filter(
            User.created_at >= month_start,
            User.created_at < next_month
        ).scalar() or 0

        projects_count = db.query(func.count(Project.id)).filter(
            Project.created_at >= month_start,
            Project.created_at < next_month
        ).scalar() or 0

        messages_count = db.query(func.count(Message.id)).filter(
            Message.created_at >= month_start,
            Message.created_at < next_month
        ).scalar() or 0

        views_count = db.query(func.sum(Project.views)).filter(
            Project.created_at >= month_start,
            Project.created_at < next_month
        ).scalar() or 0

        months_data.append({
            "month": month_start.strftime("%b"),
            "year": month_start.year,
            "users": users_count,
            "projects": projects_count,
            "messages": messages_count,
            "views": views_count
        })

    # Get data for the last 7 days
    days_data = []
    for i in range(6, -1, -1):
        day_date = now - timedelta(days=i)
        day_start = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        users_count = db.query(func.count(User.id)).filter(
            User.created_at >= day_start,
            User.created_at < day_end
        ).scalar() or 0

        messages_count = db.query(func.count(Message.id)).filter(
            Message.created_at >= day_start,
            Message.created_at < day_end
        ).scalar() or 0

        views_count = db.query(func.sum(Project.views)).scalar() or 0

        days_data.append({
            "day": day_start.strftime("%a"),
            "date": day_start.strftime("%d"),
            "users": users_count,
            "messages": messages_count,
            "views": views_count // 7  # Average daily views
        })

    # Top projects by views with extended stats
    top_projects = db.query(Project).order_by(Project.views.desc()).limit(10).all()
    top_projects_data = []
    for idx, p in enumerate(top_projects):
        # Simulate leads and conversion (in real app, this would come from actual data)
        views = p.views or 0
        leads = max(1, views // 15)  # Simulate leads
        conversion = round((leads / max(views, 1)) * 100, 1)
        revenue = leads * 150000  # Simulate revenue per lead
        trend = 5.2 if idx % 2 == 0 else -2.1  # Simulate trend

        top_projects_data.append({
            "id": p.id,
            "title": p.name_uz or p.name_ru or p.name_en,
            "views": views,
            "leads": leads,
            "conversion": conversion,
            "revenue": revenue,
            "trend": trend
        })

    # Categories breakdown
    categories_data = [
        {"name": "Web dasturlash", "value": 35, "color": "#00a6a6"},
        {"name": "Mobil ilovalar", "value": 28, "color": "#0a2d5c"},
        {"name": "AI/ML loyihalar", "value": 18, "color": "#6366f1"},
        {"name": "E-commerce", "value": 12, "color": "#f59e0b"},
        {"name": "Boshqalar", "value": 7, "color": "#94a3b8"}
    ]

    # Message statistics by status
    message_stats = {
        "new": db.query(func.count(Message.id)).filter(Message.status == MessageStatus.NEW).scalar() or 0,
        "read": db.query(func.count(Message.id)).filter(Message.status == MessageStatus.READ).scalar() or 0,
        "replied": db.query(func.count(Message.id)).filter(Message.status == MessageStatus.REPLIED).scalar() or 0,
        "archived": db.query(func.count(Message.id)).filter(Message.status == MessageStatus.ARCHIVED).scalar() or 0
    }

    # User role distribution
    user_roles = {
        "admin": db.query(func.count(User.id)).filter(User.role == UserRole.ADMIN).scalar() or 0,
        "seller": db.query(func.count(User.id)).filter(User.role == UserRole.SELLER).scalar() or 0,
        "user": db.query(func.count(User.id)).filter(User.role == UserRole.USER).scalar() or 0
    }

    # Recent activity with more details
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_users_data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in recent_users
    ]

    recent_messages = db.query(Message).order_by(Message.created_at.desc()).limit(5).all()
    recent_messages_data = [
        {
            "id": m.id,
            "name": m.name,
            "subject": m.subject,
            "status": m.status.value if m.status else "new",
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in recent_messages
    ]

    # Recent activities combined
    recent_activities = []
    for u in recent_users[:3]:
        recent_activities.append({
            "type": "user",
            "title": f"Yangi foydalanuvchi: {u.username}",
            "description": u.email,
            "time": u.created_at.isoformat() if u.created_at else None,
            "icon": "user"
        })
    for m in recent_messages[:3]:
        recent_activities.append({
            "type": "message",
            "title": f"Yangi xabar: {m.subject or 'Mavzusiz'}",
            "description": f"{m.name} dan",
            "time": m.created_at.isoformat() if m.created_at else None,
            "icon": "message"
        })
    # Sort by time
    recent_activities.sort(key=lambda x: x.get("time") or "", reverse=True)

    # Period summary stats
    period_views = db.query(func.sum(Project.views)).scalar() or 0
    period_users = db.query(func.count(User.id)).filter(User.created_at >= start_date).scalar() or 0
    period_messages = db.query(func.count(Message.id)).filter(Message.created_at >= start_date).scalar() or 0

    return {
        "period": period,
        "period_label": period_label,
        "period_stats": {
            "views": period_views,
            "users": period_users,
            "messages": period_messages
        },
        "monthly_data": months_data,
        "daily_data": days_data,
        "top_projects": top_projects_data,
        "categories": categories_data,
        "message_stats": message_stats,
        "user_roles": user_roles,
        "recent_users": recent_users_data,
        "recent_messages": recent_messages_data,
        "recent_activities": recent_activities
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



