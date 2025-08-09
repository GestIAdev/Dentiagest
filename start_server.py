"""
Script de arranque universal para DentiaGest
Puede ejecutarse desde cualquier ubicación del proyecto
"""
import os
import sys
import subprocess
from pathlib import Path

def find_backend_directory():
    """
    Encuentra el directorio backend desde cualquier ubicación.
    """
    current_dir = Path.cwd()
    
    # Buscar hacia arriba hasta encontrar backend/
    for parent in [current_dir] + list(current_dir.parents):
        backend_dir = parent / "backend"
        if backend_dir.exists() and (backend_dir / "app").exists():
            return backend_dir
    
    # Si no se encuentra, asumir que estamos en la raíz
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    
    if backend_dir.exists():
        return backend_dir
    
    raise FileNotFoundError("No se pudo encontrar el directorio backend/")

def main():
    """Ejecutar el servidor DentiaGest."""
    try:
        # Encontrar directorio backend
        backend_dir = find_backend_directory()
        print(f"📁 Backend encontrado en: {backend_dir}")
        
        # Cambiar al directorio backend
        os.chdir(backend_dir)
        print(f"📂 Directorio de trabajo: {os.getcwd()}")
        
        # Ejecutar el servidor
        print("🚀 Iniciando DentiaGest...")
        subprocess.run([sys.executable, "run.py"], check=True)
        
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("💡 Asegúrate de ejecutar desde el directorio del proyecto DentiaGest")
        return 1
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando el servidor: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
