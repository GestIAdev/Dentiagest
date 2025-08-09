@echo off
echo 🚀 Iniciando configuración del proyecto Dentiagest...

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado. Por favor, instala Docker primero.
    pause
    exit /b 1
)

REM Verificar si Docker Compose está instalado
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero.
    pause
    exit /b 1
)

REM Crear archivo .env si no existe
if not exist .env (
    echo 📝 Creando archivo .env desde .env.example...
    copy .env.example .env
    echo ⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones reales antes de continuar.
    echo    - Cambia las contraseñas
    echo    - Añade tu OPENAI_API_KEY
    echo    - Ajusta otras configuraciones según necesites
    set /p answer="¿Has editado el archivo .env? (y/N): "
    if /i not "%answer%"=="y" (
        echo ❌ Por favor, edita el archivo .env antes de continuar.
        pause
        exit /b 1
    )
)

REM Construir las imágenes Docker
echo 🔨 Construyendo imágenes Docker...
docker-compose build

REM Iniciar los servicios de base de datos y Redis
echo 🎯 Iniciando servicios de base de datos...
docker-compose up -d db redis

REM Esperar a que la base de datos esté lista
echo ⏳ Esperando a que la base de datos esté lista...
timeout /t 10

REM Ejecutar migraciones de la base de datos
echo 🗄️  Ejecutando migraciones de la base de datos...
docker-compose run --rm backend alembic upgrade head

REM Iniciar todos los servicios
echo 🚀 Iniciando todos los servicios...
docker-compose up -d

echo ✅ ¡Proyecto iniciado exitosamente!
echo.
echo 📱 Servicios disponibles:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000
echo    - Documentación API: http://localhost:8000/docs
echo    - Base de datos: localhost:5432
echo    - Redis: localhost:6379
echo.
echo 📋 Comandos útiles:
echo    - Ver logs: docker-compose logs -f
echo    - Parar servicios: docker-compose down
echo    - Reiniciar: docker-compose restart
echo.
echo 🎉 ¡Comienza a desarrollar!
pause
