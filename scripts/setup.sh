#!/bin/bash

# Script de inicialización del proyecto Dentiagest
echo "🚀 Iniciando configuración del proyecto Dentiagest..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones reales antes de continuar."
    echo "   - Cambia las contraseñas"
    echo "   - Añade tu OPENAI_API_KEY"
    echo "   - Ajusta otras configuraciones según necesites"
    read -p "¿Has editado el archivo .env? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Por favor, edita el archivo .env antes de continuar."
        exit 1
    fi
fi

# Construir las imágenes Docker
echo "🔨 Construyendo imágenes Docker..."
docker-compose build

# Iniciar los servicios
echo "🎯 Iniciando servicios..."
docker-compose up -d db redis

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Ejecutar migraciones de la base de datos
echo "🗄️  Ejecutando migraciones de la base de datos..."
docker-compose run --rm backend alembic upgrade head

# Iniciar todos los servicios
echo "🚀 Iniciando todos los servicios..."
docker-compose up -d

echo "✅ ¡Proyecto iniciado exitosamente!"
echo ""
echo "📱 Servicios disponibles:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - Documentación API: http://localhost:8000/docs"
echo "   - Base de datos: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "📋 Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Parar servicios: docker-compose down"
echo "   - Reiniciar: docker-compose restart"
echo ""
echo "🎉 ¡Comienza a desarrollar!"
