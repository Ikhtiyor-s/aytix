from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.dependencies import get_current_admin
from app.models import User, Message, MessageStatus
from app.schemas import MessageCreate, MessageUpdate, MessageResponse

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/", response_model=List[MessageResponse])
async def get_all_messages(
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all messages (admin only)."""
    query = db.query(Message)
    if status_filter:
        query = query.filter(Message.status == status_filter)
    messages = query.order_by(Message.created_at.desc()).all()
    return messages


@router.get("/stats")
async def get_message_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get message statistics."""
    total = db.query(Message).count()
    new = db.query(Message).filter(Message.status == MessageStatus.NEW).count()
    read = db.query(Message).filter(Message.status == MessageStatus.READ).count()
    replied = db.query(Message).filter(Message.status == MessageStatus.REPLIED).count()
    archived = db.query(Message).filter(Message.status == MessageStatus.ARCHIVED).count()
    return {
        "total": total,
        "new": new,
        "read": read,
        "replied": replied,
        "archived": archived
    }


@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get a single message by ID."""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db)
):
    """Create a new message (public - no auth required)."""
    message = Message(**message_data.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.put("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: int,
    message_data: MessageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a message status or add reply."""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    update_data = message_data.model_dump(exclude_unset=True)

    # If reply is being added, set replied_at and status
    if "reply" in update_data and update_data["reply"]:
        update_data["replied_at"] = datetime.utcnow()
        update_data["status"] = MessageStatus.REPLIED

    for field, value in update_data.items():
        setattr(message, field, value)

    db.commit()
    db.refresh(message)
    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a message."""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    db.delete(message)
    db.commit()
    return None
