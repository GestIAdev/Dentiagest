"""
Script de inicio para desarrollo - DentiaGest
Alternativa simple al .bat para desarrolladores que prefieren Python
Auto-configura el directorio de trabajo correcto
"""
import os
import sys
import uvicorn

# PLATFORM_CORE: Auto-configuración de directorio de trabajo
def setup_working_directory():
    """
    Configura automáticamente el directorio de trabajo correcto.
    Permite ejecutar desde cualquier ubicación.
    """
    # Obtener el directorio donde está este script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Cambiar al directorio del script (backend/)
    os.chdir(script_dir)
    
    # Agregar el directorio al Python path
    if script_dir not in sys.path:
        sys.path.insert(0, script_dir)
    
    print(f"📁 Directorio de trabajo: {os.getcwd()}")
    return script_dir

if __name__ == "__main__":
    # Configurar directorio automáticamente
    setup_working_directory()
    
    # Ahora importar la app (después de configurar el path)
    from app.main import app
    
    print("🦷 Iniciando DentiaGest Backend...")
    print("🗄️ PostgreSQL: Habilitado")
    print("🌐 Servidor: http://127.0.0.1:8002")
    print("📚 Docs: http://127.0.0.1:8002/api/v1/docs")
    print("⏹️  Presiona Ctrl+C para detener")
    print()
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8002,
        reload=True,
        log_level="info"
    )
