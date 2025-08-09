"""
Configuración de logging estructurado
"""
import logging
import structlog
from app.core.config import get_settings

settings = get_settings()


def configure_logging():
    """Configurar el sistema de logging estructurado"""
    
    # Configurar structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="ISO"),
            structlog.dev.ConsoleRenderer(colors=settings.debug)
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.getLevelName(settings.log_level)
        ),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=False,
    )
    
    # Configurar el logging estándar de Python
    logging.basicConfig(
        level=logging.getLevelName(settings.log_level),
        format="%(message)s",
    )


# Logger principal de la aplicación
logger = structlog.get_logger("dentiagest")
