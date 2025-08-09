@echo off
echo 🦷 Iniciando DentiaGest Backend con PostgreSQL...
echo.

cd /d "C:\Users\Raulacate\Desktop\Proyectos programacion\Dentiagest\backend"

echo 📋 Verificando dependencias...
C:\Python313\python.exe -c "import fastapi, uvicorn, sqlalchemy, psycopg2; print('✅ Todas las dependencias listas')"

echo 🗄️ Verificando PostgreSQL...
echo PostgreSQL Service Status:
powershell -Command "Get-Service -Name 'postgresql-x64-17' | Select-Object Status, Name"

echo.
echo 🚀 Iniciando servidor con PostgreSQL en http://127.0.0.1:8002
echo 📚 Documentación disponible en http://127.0.0.1:8002/api/v1/docs
echo 🗄️ Base de datos: PostgreSQL (dentiagest)
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

C:\Python313\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload

pause
