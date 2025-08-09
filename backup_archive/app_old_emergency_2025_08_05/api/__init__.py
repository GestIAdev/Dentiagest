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

# PLATFORM_EXTRACTABLE: Universal API routes
from .auth import router as auth_router
from .users import router as users_router

# DENTAL_SPECIFIC: Dental practice routes
from .patients import router as patients_router
from .appointments import router as appointments_router

# PLATFORM_EXTRACTABLE: Main API router
api_router = APIRouter(prefix="/api/v1")

# PLATFORM_CORE: Universal routes (available in all verticals)
api_router.include_router(auth_router)
api_router.include_router(users_router)

# DENTAL_SPECIFIC: Business vertical specific routes
api_router.include_router(patients_router)
api_router.include_router(appointments_router)

# PLATFORM_PATTERN: Future dental routes will be added here
# api_router.include_router(treatments_router)
# api_router.include_router(invoices_router)
# api_router.include_router(reports_router)

__all__ = ["api_router"]
