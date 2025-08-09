@echo off
REM PlatformGest Documentation Generator - Windows Batch Script
REM ========================================================
REM Script wrapper para facilitar el uso del generador de documentación

echo.
echo ========================================================
echo   PLATFORMGEST DOCUMENTATION GENERATOR
echo ========================================================
echo.

REM Verificar que Python esté instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado o no está en PATH
    echo Instala Python desde https://python.org
    pause
    exit /b 1
)

REM Configurar paths por defecto
set DENTIAGEST_PATH=%~dp0..
set PLATFORMGEST_DOCS_PATH=C:\Users\%USERNAME%\Desktop\Proyectos programacion\PlatformgestIA\core docs

echo 🔍 Verificando paths...
echo    DentiaGest: %DENTIAGEST_PATH%
echo    PlatformGest Docs: %PLATFORMGEST_DOCS_PATH%
echo.

REM Verificar que los directorios existan
if not exist "%DENTIAGEST_PATH%" (
    echo ❌ DentiaGest path no encontrado: %DENTIAGEST_PATH%
    pause
    exit /b 1
)

if not exist "%PLATFORMGEST_DOCS_PATH%" (
    echo ❌ PlatformGest docs path no encontrado: %PLATFORMGEST_DOCS_PATH%
    echo ⚠️  Creando directorio...
    mkdir "%PLATFORMGEST_DOCS_PATH%" 2>nul
    mkdir "%PLATFORMGEST_DOCS_PATH%\prompts" 2>nul
    mkdir "%PLATFORMGEST_DOCS_PATH%\reports" 2>nul
)

echo ✅ Paths verificados
echo.

REM Menú de opciones
:menu
echo ¿Qué quieres hacer?
echo.
echo [1] 🚀 Modo interactivo (recomendado)
echo [2] 📁 Procesar directorio específico
echo [3] 📄 Procesar archivo específico  
echo [4] 🔄 Procesar directorios principales (batch)
echo [5] 📊 Ver ayuda
echo [6] ❌ Salir
echo.

set /p choice="Elige una opción (1-6): "

if "%choice%"=="1" goto interactive
if "%choice%"=="2" goto directory
if "%choice%"=="3" goto file
if "%choice%"=="4" goto batch
if "%choice%"=="5" goto help
if "%choice%"=="6" goto exit

echo ❌ Opción inválida
goto menu

:interactive
echo.
echo 🚀 Iniciando modo interactivo...
echo.
python "%~dp0platformgest_doc_generator.py" --dentiagest-path "%DENTIAGEST_PATH%" --docs-path "%PLATFORMGEST_DOCS_PATH%" --interactive
goto end

:directory
echo.
echo 📁 PROCESAMIENTO DE DIRECTORIO
echo.
echo Ejemplos de directorios:
echo   - backend/app/api
echo   - backend/app/core
echo   - backend/app/models
echo   - backend/app/schemas
echo.
set /p target_dir="Ingresa el directorio a procesar: "

if "%target_dir%"=="" (
    echo ❌ Directorio no especificado
    goto menu
)

echo.
echo 🔄 Procesando directorio: %target_dir%
echo.
python "%~dp0platformgest_doc_generator.py" --dentiagest-path "%DENTIAGEST_PATH%" --docs-path "%PLATFORMGEST_DOCS_PATH%" --directory "%target_dir%"
goto end

:file
echo.
echo 📄 PROCESAMIENTO DE ARCHIVO
echo.
echo Ejemplos de archivos:
echo   - backend/app/api/auth.py
echo   - backend/app/models/user.py
echo   - backend/app/core/security.py
echo.
set /p target_file="Ingresa el archivo a procesar: "

if "%target_file%"=="" (
    echo ❌ Archivo no especificado
    goto menu
)

echo.
echo 🔄 Procesando archivo: %target_file%
echo.
python "%~dp0platformgest_doc_generator.py" --dentiagest-path "%DENTIAGEST_PATH%" --docs-path "%PLATFORMGEST_DOCS_PATH%" --file "%target_file%"
goto end

:batch
echo.
echo 🔄 PROCESAMIENTO BATCH - DIRECTORIOS PRINCIPALES
echo.
echo Procesando:
echo   - backend/app/api
echo   - backend/app/core  
echo   - backend/app/models
echo   - backend/app/schemas
echo.
echo ⚠️  Esto puede tomar varios minutos...
echo.
pause

python "%~dp0platformgest_doc_generator.py" --dentiagest-path "%DENTIAGEST_PATH%" --docs-path "%PLATFORMGEST_DOCS_PATH%" --directory "backend/app/api"
python "%~dp0platformgest_doc_generator.py" --dentiagest-path "%DENTIAGEST_PATH%" --docs-path "%PLATFORMGEST_DOCS_PATH%" --directory "backend/app/core"
python "%~dp0platformgest_doc_generator.py" --dentiagest-path "%DENTIAGEST_PATH%" --docs-path "%PLATFORMGEST_DOCS_PATH%" --directory "backend/app/models"
python "%~dp0platformgest_doc_generator.py" --dentiagest-path "%DENTIAGEST_PATH%" --docs-path "%PLATFORMGEST_DOCS_PATH%" --directory "backend/app/schemas"

echo.
echo ✅ Procesamiento batch completado
goto end

:help
echo.
echo 📚 AYUDA - PLATFORMGEST DOCUMENTATION GENERATOR
echo ================================================
echo.
echo Este script automatiza la extracción de patrones universales
echo desde DentiaGest hacia la documentación de PlatformGest.
echo.
echo FUNCIONES PRINCIPALES:
echo.
echo 🔍 ANÁLISIS DE CÓDIGO:
echo    - Identifica patrones universales vs específicos
echo    - Calcula porcentaje de extractabilidad
echo    - Detecta funciones, clases y endpoints
echo.
echo 📝 GENERACIÓN DE PROMPTS:
echo    - Crea prompts optimizados para Gemini
echo    - Incluye contexto y ejemplos de código
echo    - Formatea para máxima comprensión de IA
echo.
echo 📊 REPORTES:
echo    - Análisis de extractabilidad por archivo
echo    - Reportes consolidados por directorio
echo    - Tracking de progreso de documentación
echo.
echo ARCHIVOS GENERADOS:
echo    - prompts/: Prompts listos para Gemini
echo    - reports/: Reportes de análisis
echo.
echo WORKFLOW RECOMENDADO:
echo    1. Ejecutar análisis batch (opción 4)
echo    2. Revisar reportes generados
echo    3. Usar prompts individuales con Gemini
echo    4. Copiar respuestas de Gemini a documentación
echo.
echo.
pause
goto menu

:end
echo.
echo 📁 Archivos generados en: %PLATFORMGEST_DOCS_PATH%
echo.
echo ¿Quieres abrir la carpeta de documentación?
set /p open_folder="(s/n): "

if /i "%open_folder%"=="s" (
    explorer "%PLATFORMGEST_DOCS_PATH%"
)

:exit
echo.
echo 👋 ¡Gracias por usar PlatformGest Doc Generator!
echo.
pause
