"""
Configuración de la base de datos con SQLAlchemy
"""
from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from .config import get_settings

settings = get_settings()

# Motor síncrono para migraciones de Alembic
engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=30,
    # Agregar configuraciones para manejar encoding
    connect_args={
        "client_encoding": "utf8"
    }
)

# Motor asíncrono para la aplicación
async_engine = create_async_engine(
    settings.async_database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=30,
    # Agregar configuraciones para manejar encoding
    connect_args={
        "server_settings": {
            "client_encoding": "utf8"
        }
    }
)

# Sesión síncrona
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Sesión asíncrona
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base para los modelos
Base = declarative_base()


# Dependency para obtener la sesión de base de datos
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency que proporciona una sesión de base de datos"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Función síncrona para compatibilidad con Alembic
def get_db():
    """Dependency síncrona para sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Función para crear todas las tablas (solo en desarrollo)
async def create_tables():
    """Crear todas las tablas en la base de datos"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Función para verificar la conexión a la base de datos
async def check_database_connection():
    """Verificar que la conexión a la base de datos funcione"""
    try:
        async with async_engine.begin() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return False
