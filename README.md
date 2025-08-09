# 🦷 DentiaGest - Sistema de Gestión Dental

DentiaGest es un sistema completo de gestión para clínicas dentales, desarrollado con tecnologías modernas para ofrecer una experiencia profesional y eficiente.

## 🚀 Características Principales

### 📅 **Gestión de Citas**
- **Calendario interactivo** con vista mensual, semanal y diaria
- **Creación y edición** de citas con búsqueda inteligente de pacientes
- **Estados de cita**: Programada, Confirmada, En curso, Completada, Cancelada, No asistió
- **Tipos de tratamiento**: Consulta, Limpieza, Empaste, Extracción, Endodoncia, Ortodoncia, Implante, Cirugía, Otros
- **Filtrado avanzado** por estado y tipo de cita
- **Eliminación segura** con confirmación

### 👥 **Gestión de Pacientes**
- **Búsqueda autocompletada** por nombre, email o teléfono
- **Perfiles completos** de pacientes
- **Historial de citas** por paciente

### 🔐 **Autenticación y Seguridad**
- **JWT Authentication** con tokens de acceso y refresh
- **Middleware de autenticación** robusto
- **Manejo de sesiones** con renovación automática

### 💾 **Base de Datos**
- **PostgreSQL** con UUIDs para identificadores únicos
- **Migraciones Alembic** para versionado de esquemas
- **Soft delete** para mantener historial
- **Validaciones Pydantic** para integridad de datos

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 18** con TypeScript
- **Tailwind CSS** para estilos modernos
- **FullCalendar** para gestión de calendario
- **Heroicons** para iconografía
- **Axios** para comunicación API

### **Backend**
- **FastAPI** (Python) para API REST
- **SQLAlchemy** ORM con PostgreSQL
- **Pydantic** para validación de datos
- **Alembic** para migraciones
- **JWT** para autenticación

### **DevOps**
- **Docker & Docker Compose** para containerización
- **PostgreSQL** en contenedor
- **Hot reload** para desarrollo

## 📦 Instalación y Configuración

### **Prerrequisitos**
- Docker y Docker Compose
- Node.js 16+ y npm
- Python 3.11+

### **1. Clonar el repositorio**
```bash
git clone https://github.com/pinkyfloyder82/dentiagest.git
cd dentiagest
```

### **2. Configurar variables de entorno**
Crear archivo `.env` en la raíz del proyecto:
```env
# Database
POSTGRES_DB=dentiagest
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/dentiagest

# JWT
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# API
API_V1_STR=/api/v1
PROJECT_NAME=DentiaGest
```

### **3. Iniciar con Docker**
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### **4. Configurar la base de datos**
```bash
# Ejecutar migraciones
cd backend
alembic upgrade head

# Crear usuarios demo (opcional)
python create_demo_users.py

# Poblar con pacientes demo (opcional)
python seed_demo_patients.py
```

### **5. Desarrollo local (alternativo)**

#### **Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

#### **Frontend**
```bash
cd frontend
npm install
npm start
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **Documentación API**: http://localhost:8002/docs
- **Base de datos**: PostgreSQL en puerto 5432

## 📱 Uso del Sistema

### **Acceso**
1. Navegar a http://localhost:3000
2. Iniciar sesión con credenciales
3. Acceder al calendario principal

### **Gestión de Citas**
1. **Crear cita**: Click en "+" o en un día del calendario
2. **Editar cita**: Click en una cita existente
3. **Filtrar**: Usar los botones de estado en la parte superior
4. **Buscar paciente**: Escribir en el campo de búsqueda con autocompletado

### **Estados de Cita**
- 🔵 **Programada**: Cita inicial creada
- 🟢 **Confirmada**: Paciente confirmó asistencia
- 🟡 **En curso**: Cita en progreso
- ✅ **Completada**: Tratamiento finalizado
- 🔴 **Cancelada**: Cita cancelada
- ⚫ **No asistió**: Paciente no compareció

## 🗂️ Estructura del Proyecto

```
dentiagest/
├── 🐳 docker-compose.yml          # Configuración Docker
├── 📄 README.md                   # Este archivo
├── 🚫 .gitignore                  # Archivos ignorados por Git
│
├── 🖥️ frontend/                   # Aplicación React
│   ├── 📦 package.json
│   ├── 🎨 tailwind.config.js
│   ├── 📁 public/
│   └── 📁 src/
│       ├── 📄 index.tsx           # Punto de entrada
│       ├── 📁 components/         # Componentes React
│       │   ├── CreateAppointmentModal.tsx
│       │   └── EditAppointmentModal.tsx
│       ├── 📁 pages/              # Páginas principales
│       │   └── CalendarPage.tsx
│       ├── 📁 hooks/              # Hooks personalizados
│       │   ├── useAppointments.ts
│       │   └── usePatients.ts
│       ├── 📁 context/            # Context providers
│       │   └── AuthContext.tsx
│       └── 📁 utils/              # Utilidades
│
├── ⚙️ backend/                    # API FastAPI
│   ├── 🐳 Dockerfile
│   ├── 📦 requirements.txt
│   ├── 🚀 run.py                  # Punto de entrada
│   ├── 📁 app/
│   │   ├── 📄 main.py             # Aplicación principal
│   │   ├── 📁 api/v1/             # Endpoints API
│   │   │   ├── appointments.py
│   │   │   ├── patients.py
│   │   │   └── auth.py
│   │   ├── 📁 core/               # Configuración core
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── 📁 models/             # Modelos SQLAlchemy
│   │   │   ├── appointment.py
│   │   │   ├── patient.py
│   │   │   └── user.py
│   │   ├── 📁 schemas/            # Esquemas Pydantic
│   │   └── 📁 services/           # Lógica de negocio
│   │
│   └── 📁 alembic/                # Migraciones de BD
│       └── 📁 versions/
│
├── 📁 docs/                       # Documentación
│   ├── 📁 specs/                  # Especificaciones técnicas
│   ├── 📁 Dev_diary/              # Diario de desarrollo
│   └── 📁 IA/                     # Documentación IA
│
└── 📁 scripts/                    # Scripts de utilidad
    └── setup.bat                  # Script de configuración Windows
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🚀 Despliegue

### **Producción con Docker**
```bash
# Build para producción
docker-compose -f docker-compose.prod.yml up -d

# Configurar variables de entorno de producción
cp .env.example .env.production
```

### **Variables de entorno de producción**
- Configurar `DATABASE_URL` con PostgreSQL de producción
- Generar `SECRET_KEY` segura
- Configurar CORS apropiadamente
- Habilitar HTTPS

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crear rama** para feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir Pull Request**

## 📋 Roadmap

### **🔮 Próximas características**
- [ ] **Dashboard analítico** con métricas de la clínica
- [ ] **Gestión de inventario** de material dental
- [ ] **Sistema de facturación** integrado
- [ ] **Notificaciones push** para recordatorios
- [ ] **App móvil** para pacientes
- [ ] **Reportes PDF** de tratamientos
- [ ] **Integración con APIs** de seguros médicos
- [ ] **Backup automático** en la nube

### **🛠️ Mejoras técnicas**
- [ ] **Tests unitarios** completos
- [ ] **CI/CD pipeline** con GitHub Actions
- [ ] **Monitoring** con Grafana/Prometheus
- [ ] **Cache Redis** para optimización
- [ ] **Websockets** para actualizaciones en tiempo real

## 📞 Soporte

Para soporte, abrir un **issue** en GitHub o contactar:
- **Email**: support@dentiagest.com
- **GitHub**: [@pinkyfloyder82](https://github.com/pinkyfloyder82)

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 🎯 Información de Desarrollo

**Versión**: 1.0.0  
**Última actualización**: Agosto 2025  
**Estado**: En desarrollo activo  

### **🔧 Comandos útiles**

```bash
# Reiniciar servicios Docker
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Acceder al contenedor de base de datos
docker-compose exec db psql -U postgres -d dentiagest

# Backup de base de datos
docker-compose exec db pg_dump -U postgres dentiagest > backup.sql

# Limpiar contenedores
docker-compose down --volumes --remove-orphans
```

### **🐛 Debugging**

- **Backend API**: http://localhost:8002/docs para Swagger UI
- **Frontend**: Developer tools del navegador
- **Logs**: `docker-compose logs <service>`
- **Base de datos**: Conectar con cliente PostgreSQL en puerto 5432

---

**¡Gracias por usar DentiaGest! 🦷✨**
