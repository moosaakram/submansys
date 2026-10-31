from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns the operational status of the Brightloop 360 API",
    response_description="API health status and confirmation message",
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="success",
        message="Brightloop 360 API is running",
    )
