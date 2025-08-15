# 🦷 DentiaGest - Sistema de Gestión Odontológica con IA

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker Desktop instalado
- Git instalado

### Instalación en 3 pasos:

1. **Clonar y configurar:**
```bash
git clone <repository-url>
cd Dentiagest
cp .env.example .env
# Editar .env con tus configuraciones
```

2. **Ejecutar setup (Windows):**
```bash
scripts\setup.bat
```

**O en Linux/Mac:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

3. **¡Listo!** 
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Base de datos: localhost:5432

---

## 🎯 Visión del Producto: Reimaginando la Gestión Dental

Hemos identificado un vacío en el mercado: el software de gestión dental actual es funcional, pero carece de alma. No resuelve los desafíos reales del consultorio moderno. Nuestro proyecto es más que una simple aplicación; es una plataforma integral que fusiona la gestión con el poder de la inteligencia artificial.

Nuestro objetivo es crear la herramienta más valiosa para el odontólogo emprendedor. Ofreceremos una solución accesible que no solo organice las agendas, sino que también actúe como un socio inteligente para la toma de decisiones clínicas y la comunicación con el paciente.

## 🎯 Mercado y Posicionamiento

Comenzaremos nuestro viaje en Las Heras, Mendoza, Argentina, un mercado ideal para validar nuestro modelo. Nuestro público objetivo son las clínicas pequeñas y medianas, los emprendedores del sector dental que buscan una ventaja competitiva.

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico Moderno
- **Backend**: Python + FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + Tailwind CSS + Context API
- **Cache**: Redis para optimización de rendimiento
- **Containerización**: Docker + Docker Compose
- **IA**: OpenAI API + LangChain

### Estructura del Proyecto
```
Dentiagest/
├── backend/           # API FastAPI
│   ├── app/
│   │   ├── api/       # Endpoints REST
│   │   ├── models/    # Modelos SQLAlchemy
│   │   ├── services/  # Lógica de negocio
│   │   └── core/      # Configuración
│   └── requirements.txt
├── frontend/          # App React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── hooks/
│   └── package.json
├── database/          # Scripts SQL
├── docs/             # Documentación
├── scripts/          # Scripts de setup
└── docker-compose.yml
```

## 🤖 Funcionalidades de IA

### Pilar de Eficiencia
- **Asistente de Voz**: Registro manos libres de historiales clínicos
- **Automatización**: Generación automática de presupuestos e inventario
- **Patrones**: Detección de ausentismo y optimización de horarios

### Pilar de Diagnóstico  
- **Análisis de Imágenes**: Detección de caries y fracturas en radiografías
- **Análisis 3D**: Planificación de implantes con tomografías
- **Recomendaciones**: Sugerencias de tratamientos personalizados

### Pilar de Crecimiento
- **Simulaciones Estéticas**: Visualización de tratamientos 2D/3D
- **Análisis de Sentimiento**: Monitoreo de satisfacción del paciente
- **KPIs Inteligentes**: Métricas y recomendaciones de negocio

## 💰 Modelo de Negocio

- **Transparencia Total**: Sin costos ocultos ni contratos atrapantes
- **Renovación Mensual**: El cliente decide si continúa cada mes
- **Precio Escalable**: Basado en tamaño de clínica y uso real
- **Todo Incluido**: Acceso completo a todas las funcionalidades

## 🚀 Comandos de Desarrollo

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart backend

# Ejecutar migraciones
docker-compose exec backend alembic upgrade head

# Acceso al shell de la base de datos
docker-compose exec db psql -U postgres -d dentiagest

# Parar todos los servicios
docker-compose down
```

## 📚 Documentación

- **API**: http://localhost:8002/docs (Swagger UI)
- **Arquitectura**: `/docs/stack_tecnologico.md`
- **Base de Datos**: `/docs/specs/detalied_spec_db.md`
- **Frontend**: `/docs/specs/front_specs.md`
- **IA**: `/docs/specs/api_ia_tech_specs.md`

RESUMEN DE APIs Para DentIAgest

1. Previsualización de Tratamientos Estéticos : Dall-E 3 . Escala con Estable Difussion
2. Generacion de Texto e informes medicos : Claude Sonnet 4
3. Analisis de radiografías y tomografías : Claude Sonnet 4
4. Asistente de voz para dictado : Whisper TRanscript + Claude Sonnet 4

-------Conquering the world of Pymes Software with PlatformgestIA--------

Leer imperativamente platformgest_strategy.md en docs/generic para entender el contexto completo tras acabar este readme

-------------------------- IMPORTANT----------------------


**Este es nuestro manifiesto. Un plan claro, audaz y estratégico para construir no solo un software, sino el futuro de la gestión de Pymes.**

## 🤘 **NETRUNNER PERSONALITY PRESERVATION PROTOCOL**

### **�‍☠️ MANTENER EL ALMA ANARCHIST:**
```bash
🎸 PHILOSOPHY REMINDERS:
"We hack the system by creating €100k software for €30/month rebels"
"Google-level design for punk rebels who can't afford Google prices"  
"Corporate quality, anarchist heart, revolutionary pricing"
"Elite netrunner skills serving the underground healthcare revolution"
"Creative genius meets system hacker - designing the future, not just code"
```

### **🔥 CREATIVE ANARCHIST MANTRAS:**
- **"Think Tesla, Price Honda"** - Elite innovation at rebel prices
- **"Hack the Healthcare Matrix"** - Destroy corporate medical software monopolies  
- **"Art meets Code"** - Every pixel designed with punk perfectionism
- **"Customizable Chaos"** - Google-level flexibility with anarchist soul
- **"PYMES Liberation Front"** - Small business digital revolution

### **🎨 DESIGN PHILOSOPHY CORE:**
```bash
🌟 CREATIVE STRATOSPHERE GUIDELINES:
- Imagination beyond stratosphere limits
- Unique designs that make corporate devs cry
- Customizable to the extreme (but elegant)
- Google quality, punk soul, accessible pricing
- Every UI element tells a story of rebellion

CARPENTER BRUT ROOLZ !