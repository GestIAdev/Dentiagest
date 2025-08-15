# PLATFORM_EXTRACTABLE: API package initialization
"""
API package for DentiaGest.
Contains all FastAPI route handlers organized by domain.

PLATFORM_PATTERN: This structure is reusable across business verticals:
- auth.py: Universal authentication (100% extractable)
- users.py: Universal user management (100% extractable)  
- patients.py: Dental-specific (0% extractable, but pattern reusable)
"""

from fastapi import APIRouter
from .v1 import api_router as api_v1_router
from .v2.unified_documents_minimal import router as unified_documents_router

# PLATFORM_EXTRACTABLE: Main API router
api_router = APIRouter(prefix="/api")

# Include v1 routes
api_router.include_router(api_v1_router, prefix="/v1")

# Include v2 unified documents routes
api_router.include_router(unified_documents_router)

# Basic endpoints for now
@api_router.get("/")
async def api_root():
    """API root endpoint"""
    return {
        "message": "DentiaGest API",
        "status": "active",
        "version": "1.0.0",
        "available_versions": ["v1", "v2"]
    }

@api_router.get("/status")
async def api_status():
    """API status check"""
    return {
        "api_version": "current",
        "status": "running",
        "endpoints": ["health", "status", "v1"]
    }

__all__ = ["api_router"]