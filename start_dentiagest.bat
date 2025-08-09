@echo off
REM Script de arranque universal para DentiaGest
REM Detecta automáticamente la ubicación correcta

echo 🦷 DentiaGest - Script de Arranque Universal
echo.

REM Detectar si estamos en la raíz o en backend
if exist "backend\app\main.py" (
    echo 📁 Detectado: Ejecutando desde raíz del proyecto
    cd backend
    echo 📂 Cambiando a directorio: %CD%
) else if exist "app\main.py" (
    echo 📁 Detectado: Ya estamos en directorio backend
    echo 📂 Directorio actual: %CD%
) else (
    echo ❌ Error: No se encuentra la estructura del proyecto
    echo 💡 Ejecuta este script desde la raíz del proyecto DentiaGest
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidor DentiaGest...
echo 🌐 URL: http://127.0.0.1:8002
echo 📚 Docs: http://127.0.0.1:8002/api/v1/docs
echo ⏹️  Presiona Ctrl+C para detener
echo.

python run.py

pause
