# PLATFORM_EXTRACTABLE: Main FastAPI application
"""
Main FastAPI application for DentiaGest.
This structure is designed to be reusable across business verticals
with minimal modifications.

PLATFORM_PATTERN: The app structure follows universal patterns:
- Core middleware and security (100% extractable)
- API routing structure (100% extractable)  
- Database initialization (100% extractable)
- Error handling (100% extractable)
- Only business-specific routes are dental-specific
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from contextlib import asynccontextmanager
import time
import logging

from .core.config import get_settings
from .core.database import engine, Base
from .api import api_router

# Get settings
settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# PLATFORM_EXTRACTABLE: Database initialization (universal pattern)
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.
    
    PLATFORM_CORE: Universal startup/shutdown logic.
    Database creation and cleanup is the same across all verticals.
    """
    
    # Startup
    logger.info("Starting DentiaGest application...")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        # Don't raise in development - let app start without DB
        if settings.environment == "production":
            raise
        else:
            logger.warning("Continuing without database in development mode")
    
    logger.info("DentiaGest application started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down DentiaGest application...")

# PLATFORM_EXTRACTABLE: FastAPI app initialization (universal pattern)
def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.
    
    PLATFORM_CORE: Universal app factory pattern.
    Can be reused across all business verticals.
    """
    
    app = FastAPI(
        title=settings.app_name,
        description="Sistema de gestión dental moderno con IA",
        version=settings.version,
        openapi_url="/api/v1/openapi.json" if settings.environment != "production" else None,
        docs_url="/api/v1/docs" if settings.environment != "production" else None,
        redoc_url="/api/v1/redoc" if settings.environment != "production" else None,
        lifespan=lifespan
    )

    # LOG: Mostrar orígenes permitidos por CORS en el arranque
    print(f"[CORS] Orígenes permitidos: {settings.cors_origins}")
    # PLATFORM_EXTRACTABLE: Security middleware (universal)
    setup_middleware(app)
    
    # PLATFORM_EXTRACTABLE: Error handlers (universal)
    setup_error_handlers(app)
    
    # PLATFORM_EXTRACTABLE: API routes (universal structure)
    app.include_router(api_router)
    
    return app

# PLATFORM_EXTRACTABLE: Middleware configuration (universal security)
def setup_middleware(app: FastAPI) -> None:
    """
    Configure application middleware.
    
    PLATFORM_CORE: Universal security and performance middleware.
    Same configuration needed across all business verticals.
    """
    
    # DEBUG: Print CORS configuration
    cors_origins = settings.cors_origins + [
        "http://localhost:8002",  # Explicit fallback
        "http://127.0.0.1:8002",
        "http://localhost:3000",  # Explicit fallback  
        "http://127.0.0.1:3000"
    ]
    
    print(f"🌐 CORS Origins configured: {cors_origins}")
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
        allow_headers=["*"],
        expose_headers=["*"]
    )
    
    # Trusted host middleware (security)
    if settings.environment == "production":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["*"]  # Configure properly in production
        )
    
    # Request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        """Add processing time to response headers."""
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """Log all HTTP requests for monitoring."""
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response: {response.status_code} "
            f"({process_time:.3f}s)"
        )
        
        return response

# PLATFORM_EXTRACTABLE: Error handling (universal patterns)
def setup_error_handlers(app: FastAPI) -> None:
    """
    Configure global error handlers.
    
    PLATFORM_CORE: Universal error handling for consistent API responses.
    Same error formats needed across all business verticals.
    """
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle Pydantic validation errors."""
        logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
        
        # Convert errors to JSON-serializable format
        serialized_errors = []
        for error in exc.errors():
            serialized_error = {
                "type": error.get("type"),
                "loc": error.get("loc", []),
                "msg": str(error.get("msg", "")),
                "input": str(error.get("input", "")) if error.get("input") is not None else None
            }
            serialized_errors.append(serialized_error)
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Validation error",
                "errors": serialized_errors,
                "type": "validation_error"
            }
        )
    
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        """Handle ValueError exceptions."""
        logger.warning(f"Value error on {request.url.path}: {str(exc)}")
        
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "detail": str(exc),
                "type": "value_error"
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions."""
        logger.error(f"Unexpected error on {request.url.path}: {str(exc)}", exc_info=True)
        
        if settings.environment == "production":
            detail = "Internal server error"
        else:
            detail = str(exc)
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": detail,
                "type": "internal_error"
            }
        )

# PLATFORM_EXTRACTABLE: Health check endpoint (universal monitoring)
def add_health_endpoints(app: FastAPI) -> None:
    """
    Add health check endpoints for monitoring.
    
    PLATFORM_CORE: Universal health monitoring endpoints.
    Same monitoring needs across all business verticals.
    """
    
    @app.get("/health", tags=["monitoring"])
    async def health_check():
        """Basic health check endpoint."""
        return {
            "status": "healthy",
            "service": settings.app_name,
            "version": settings.version,
            "environment": settings.environment
        }
    
    @app.get("/health/detailed", tags=["monitoring"])
    async def detailed_health_check():
        """Detailed health check with database connectivity."""
        from .core.database import get_db
        
        try:
            # Test database connection
            db = next(get_db())
            db.execute("SELECT 1")
            db_status = "connected"
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            db_status = "disconnected"
        
        return {
            "status": "healthy" if db_status == "connected" else "unhealthy",
            "service": settings.app_name,
            "version": settings.version,
            "environment": settings.environment,
            "checks": {
                "database": db_status
            }
        }

# PLATFORM_EXTRACTABLE: Custom OpenAPI configuration (universal documentation)
def custom_openapi(app: FastAPI):
    """
    Customize OpenAPI schema.
    
    PLATFORM_CORE: Universal API documentation customization.
    """
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=settings.app_name,
        version=settings.version,
        description="Sistema de gestión dental moderno con IA",
        routes=app.routes,
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter JWT token"
        }
    }
    
    # Add global security requirement
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

# Create the application instance
app = create_app()

# Add health endpoints
add_health_endpoints(app)

# Set custom OpenAPI
app.openapi = lambda: custom_openapi(app)

# PLATFORM_EXTRACTABLE: Root endpoint (universal welcome)
@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint with service information.
    
    PLATFORM_PATTERN: Each vertical will have similar welcome message:
    - DentiaGest: "Dental Practice Management System"
    - VetGest: "Veterinary Practice Management System"
    - MechaGest: "Auto Shop Management System"
    """
    return {
        "service": settings.app_name,
        "version": settings.version,
        "description": "Sistema de gestión dental moderno con IA",
        "status": "running",
        "docs_url": "/api/v1/docs" if settings.environment != "production" else None,
        "api_url": "/api/v1"
    }

# DENTAL_SPECIFIC: Custom endpoints for dental practice
@app.get("/api/v1/practice-info", tags=["practice"])
async def get_practice_info():
    """
    Get dental practice information.
    
    DENTAL_SPECIFIC: Practice-specific information endpoint.
    
    PLATFORM_PATTERN: Each vertical will have similar endpoints:
    - VetGest: /api/v1/clinic-info (veterinary clinic details)
    - MechaGest: /api/v1/shop-info (auto shop details)
    - RestaurantGest: /api/v1/restaurant-info (restaurant details)
    """
    return {
        "practice_type": "dental",
        "features": [
            "Patient Management",
            "Appointment Scheduling", 
            "Treatment Records",
            "Dental Insurance Management",
            "AI-Powered Voice Assistant",
            "Radiograph Analysis",
            "Invoice Generation",
            "Reporting & Analytics"
        ],
        "ai_capabilities": [
            "Voice-to-text patient notes",
            "Automated appointment booking",
            "Dental radiograph analysis",
            "Treatment recommendations",
            "Insurance claim assistance"
        ]
    }


# 🏴‍☠️ DEVELOPMENT ONLY ENDPOINT
@app.post("/api/dev/reset-rate-limits", tags=["development"])
async def reset_rate_limits():
    """
    🏴‍☠️ DEVELOPMENT ONLY: Reset all rate limiting memory.
    
    This endpoint clears all blocked users and rate limiting history.
    Use this when React development mode triggers too many requests.
    
    WARNING: This endpoint should NEVER exist in production!
    """
    from .core.threat_detection import threat_detector
    
    threat_detector.reset_for_development()
    
    return {
        "message": "🏴‍☠️ Rate limiting memory has been reset!",
        "status": "cleared",
        "warning": "This is a DEVELOPMENT-ONLY operation"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development",
        log_level="info"
    )
