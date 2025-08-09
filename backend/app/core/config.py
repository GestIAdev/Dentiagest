"""
Configuración principal de la aplicación
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Configuración de la aplicación usando Pydantic Settings"""
    
    # Información básica de la app
    app_name: str = Field(default="DentiaGest API", alias="APP_NAME")
    version: str = Field(default="1.0.0", alias="VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    # Base de datos PostgreSQL
    db_host: str = Field(alias="DB_HOST")
    db_port: int = Field(default=5432, alias="DB_PORT")
    db_user: str = Field(alias="DB_USER")
    db_password: str = Field(alias="DB_PASSWORD")
    db_name: str = Field(alias="DB_NAME")
    
    # URLs de base de datos
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    @property
    def async_database_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    # Redis
    redis_url: str = Field(default="redis://localhost:6379", alias="REDIS_URL")
    
    # Seguridad
    secret_key: str = Field(alias="SECRET_KEY")
    jwt_secret_key: str = Field(alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expiration_hours: int = Field(default=24, alias="JWT_EXPIRATION_HOURS")
    
    # CORS
    cors_origins: List[str] = Field(
        default=[
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://localhost:8002",  # Added for current backend port
            "http://127.0.0.1:8002"   # Added for current backend port
        ],
        alias="CORS_ORIGINS"
    )
    
    # APIs externas
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    ai_provider_url: str = Field(default="https://api.openai.com/v1/", alias="AI_PROVIDER_URL")
    
    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"  # Permitir variables extras del .env


# Instancia global de configuración
settings = Settings()


def get_settings() -> Settings:
    """Función para obtener la configuración (útil para dependency injection)"""
    return settings
