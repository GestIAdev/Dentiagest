"""
Router principal de la API v1
"""
from fastapi import APIRouter

# Import available routers
from .appointments import router as appointments_router
from .auth import router as auth_router
from .users import router as users_router
from .patients import router as patients_router

api_router = APIRouter()

# Include routers
api_router.include_router(appointments_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(patients_router)

# Status endpoint
@api_router.get("/status")
async def api_status():
    """Endpoint de estado de la API v1"""
    return {
        "api_version": "v1",
        "status": "active",
        "endpoints": {
            "appointments": "active",
            "auth": "active", 
            "users": "active", 
            "patients": "active",
            "treatments": "planned",
            "ai": "planned"
        }
    }
