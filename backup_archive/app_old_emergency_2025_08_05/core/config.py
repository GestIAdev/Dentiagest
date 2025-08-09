# PLATFORM_EXTRACTABLE: Configuration management - 100% reusable
"""
Application configuration management using Pydantic Settings.
This entire configuration system is extractable to PlatformGest.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os

class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    All settings are designed to be universal across different business verticals.
    """
    
    # PLATFORM_CORE: Database settings - universal
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "postgres"
    db_password: str = "password"
    db_name: str = "dentiagest"
    
    # PLATFORM_EXTRACTABLE: API configuration (universal)
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DentiaGest"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "Dental Practice Management System with AI Integration"
    
    # PLATFORM_EXTRACTABLE: Environment and deployment
    ENVIRONMENT: str = Field(default="development")
    ALLOWED_HOSTS: List[str] = Field(default=["localhost", "127.0.0.1"])
    BACKEND_CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080"]
    )
    
    # PLATFORM_EXTRACTABLE: Security settings (universal)
    SECRET_KEY: str = Field(..., min_length=32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"  # SECTOR_SPECIFIC: Database name
    
    # PLATFORM_CORE: Security settings - universal
    secret_key: str = "your-secret-key-change-in-production"
    jwt_secret_key: str = "your-jwt-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # PLATFORM_CORE: Application settings - universal
    app_name: str = "DentiaGest"  # SECTOR_SPECIFIC: App name
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"
    
    # PLATFORM_CORE: CORS settings - universal
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # PLATFORM_CORE: AI Integration settings - universal pattern
    openai_api_key: Optional[str] = None
    ai_provider_url: str = "https://api.openai.com/v1/"
    ai_model_text: str = "gpt-4o-mini"  # CONFIGURABLE: Per sector preferences
    ai_model_image: str = "gpt-4-vision-preview"
    
    # PLATFORM_CORE: Redis settings - universal
    redis_url: str = "redis://localhost:6379"
    
    # PLATFORM_CORE: File upload settings - universal
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_image_types: List[str] = ["image/jpeg", "image/png", "image/webp"]
    upload_path: str = "uploads"
    
    # PLATFORM_CONFIGURABLE: Business-specific settings
    # These can be configured per sector in PlatformGest
    default_appointment_duration: int = 30  # minutes
    business_hours_start: str = "08:00"
    business_hours_end: str = "18:00"
    default_timezone: str = "America/Argentina/Mendoza"
    
    # DENTAL_SPECIFIC: Dental practice specific settings
    tooth_numbering_system: str = "universal"  # universal, fdi, american
    
    # Additional configuration fields from .env
    database_url: Optional[str] = None
    database_url_test: Optional[str] = None
    smtp_tls: bool = True
    smtp_port: int = 587
    smtp_host: str = "smtp.gmail.com"
    smtp_user: str = ""
    smtp_password: str = ""
    version: str = "1.0.0"
    description: str = "Sistema de Gestión Odontológica con IA"
    allowed_file_types: str = '["jpg", "jpeg", "png", "pdf", "dcm"]'
    default_page_size: int = 50
    max_page_size: int = 100
    log_level: str = "INFO"
    log_file: str = "logs/dentiagest.log"

    class Config:
        env_file = ".env"
        case_sensitive = False

# PLATFORM_CORE: Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get the settings instance."""
    return settings

# PLATFORM_CORE: Database URL builder
def get_database_url() -> str:
    """Build database URL from settings."""
    return (
        f"postgresql://{settings.db_user}:{settings.db_password}@"
        f"{settings.db_host}:{settings.db_port}/{settings.db_name}"
    )
