from fastapi import APIRouter, Depends
from app.dependencies import get_current_admin
from app.admin.router import get_stats

router = APIRouter(prefix="/stats", tags=["stats"])

# Re-export stats endpoint
router.add_api_route("/", get_stats, methods=["GET"])



