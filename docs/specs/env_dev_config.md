Documentación de Configuración del Entorno de Desarrollo
Este documento detalla la configuración del entorno de desarrollo utilizando Docker y Docker Compose. El objetivo es que cualquier desarrollador pueda iniciar el proyecto con un solo comando, sin preocuparse por la instalación manual de dependencias.

1. Estructura de Archivos y Carpetas
El archivo principal de configuración será docker-compose.yml, ubicado en la raíz del proyecto. Las variables de entorno se gestionarán en un archivo .env.

2. Archivo docker-compose.yml
Este archivo orquestará los servicios de la aplicación: el backend, la base de datos de PostgreSQL y la caché de Redis.

db:

Imagen: postgres:14-alpine (una versión ligera de PostgreSQL).

Contenedor: Se asignará un nombre para fácil referencia, por ejemplo app_db.

Puertos: Mapeará el puerto interno del contenedor al puerto local (5432:5432).

Variables de Entorno: Se configurarán el nombre de la base de datos, el usuario y la contraseña, que se obtendrán del archivo .env.

redis:

Imagen: redis:alpine.

Contenedor: app_redis.

Puertos: 6379:6379.

backend:

Imagen: Se construirá desde el Dockerfile del backend.

Puertos: Mapeará el puerto de la API (8000:8000).

Volúmenes: Se montará el código fuente local en el contenedor para permitir la recarga automática (auto-reloading).

Dependencias: Se configurará para que inicie solo después de que el contenedor de la base de datos esté listo.

Variables de Entorno: Obtenidas del archivo .env, incluyendo las credenciales de la base de datos y de la API.

3. Archivo .env y Variables de Entorno
Este archivo almacenará las credenciales y configuraciones sensibles.

DATABASE_URL: postgresql://user:password@db:5432/dbname

POSTGRES_USER: user

POSTGRES_PASSWORD: password

POSTGRES_DB: dbname

SECRET_KEY: Clave secreta para JWT.

REDIS_URL: redis://redis:6379

4. Scripts de Inicialización
Se crearán scripts sencillos en el Dockerfile del backend para inicializar la base de datos y ejecutar las migraciones necesarias.

Un script de entrypoint.sh se encargará de esperar a que la base de datos esté disponible antes de iniciar el servidor de la API.

El comando de inicio del servidor (uvicorn main:app --host 0.0.0.0 --port 8000 --reload) se encargará de la recarga automática.