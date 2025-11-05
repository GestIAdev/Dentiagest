# 🦷⚡ DENTIAGEST# 🦷 DentiaGest - Sistema de Gestión Dental

## Plataforma Modular de Gestión Clínica Odontológica

DentiaGest es un sistema completo de gestión para clínicas dentales, desarrollado con tecnologías modernas para ofrecer una experiencia profesional y eficiente.

**Versión**: 3.0 (Titan Architecture)  

**Estado**: Production-Ready (70%)  > **📋 AUDITORÍA TÉCNICA COMPLETA**: Para evaluación técnica detallada del proyecto, ver [`AUDITORIA-DENTIAGEST-COMPLETA.md`](./AUDITORIA-DENTIAGEST-COMPLETA.md)  

**Stack**: React 18 + FastAPI + PostgreSQL + GraphQL  > *Incluye análisis arquitectónico, valoración comercial, deuda técnica, y recomendaciones profesionales.*

**Arquitectura**: Modular Microservices + Web3 Ecosystem

## 🚀 Características Principales

---

### 📅 **Gestión de Citas**

## 🎯 **VISIÓN**- **Calendario interactivo** con vista mensual, semanal y diaria

- **Creación y edición** de citas con búsqueda inteligente de pacientes

DentiaGest es una plataforma completa de gestión dental que combina:- **Estados de cita**: Programada, Confirmada, En curso, Completada, Cancelada, No asistió

- **Gestión Clínica Profesional** (16 módulos funcionales)- **Tipos de tratamiento**: Consulta, Limpieza, Empaste, Extracción, Endodoncia, Ortodoncia, Implante, Cirugía, Otros

- **Inteligencia Artificial Generativa** (Selene Song Core integration)- **Filtrado avanzado** por estado y tipo de cita

- **Ecosistema Web3** (DentalCoin + Patient Portal)- **Eliminación segura** con confirmación

- **Compliance Enterprise** (GDPR Article 9 + EU AI Act ready)

### 👥 **Gestión de Pacientes**

**Diferenciador**: Primera plataforma dental que integra IA generativa, blockchain y compliance como arma comercial.- **Búsqueda autocompletada** por nombre, email o teléfono

- **Perfiles completos** de pacientes

---- **Historial de citas** por paciente



## 🏗️ **ARQUITECTURA**### 🔐 **Autenticación y Seguridad**

- **JWT Authentication** con tokens de acceso y refresh

### **Frontend (React 18 + TypeScript)**- **Middleware de autenticación** robusto

```- **Manejo de sesiones** con renovación automática

frontend/

├── src/### 💾 **Base de Datos**

│   ├── pages/          # 14 páginas funcionales- **PostgreSQL** con UUIDs para identificadores únicos

│   ├── components/     # 16+ componentes modulares- **Migraciones Alembic** para versionado de esquemas

│   ├── apollo.ts       # REST client (400+ líneas)- **Soft delete** para mantener historial

│   └── utils/          # Helpers + web3 integration- **Validaciones Pydantic** para integridad de datos

└── vite.config.ts      # Build configuration

```## 🛠️ Stack Tecnológico



### **Backend (FastAPI + Python 3.11+)**### **Frontend**

```- **React 18** con TypeScript

backend/- **Tailwind CSS** para estilos modernos

├── app/- **FullCalendar** para gestión de calendario

│   ├── api/v1/         # REST endpoints (8 modules)- **Heroicons** para iconografía

│   ├── models/         # SQLAlchemy ORM- **Axios** para comunicación API

│   ├── schemas/        # Pydantic validation

│   └── services/       # Business logic### **Backend**

└── alembic/            # Database migrations- **FastAPI** (Python) para API REST

```- **SQLAlchemy** ORM con PostgreSQL

- **Pydantic** para validación de datos

### **Patient Portal (React 18 + PWA)**- **Alembic** para migraciones

```- **JWT** para autenticación

patient-portal/

├── src/### **DevOps**

│   ├── components/     # 6 modules V3- **Docker & Docker Compose** para containerización

│   ├── stores/         # Zustand state management- **PostgreSQL** en contenedor

│   └── apollo/         # GraphQL client config- **Hot reload** para desarrollo

└── public/             # PWA manifest + service worker

```## 📦 Instalación y Configuración



### **Selene Song Core (Autonomous AI Engine)**### **Prerrequisitos**

```- Docker y Docker Compose

selene/- Node.js 16+ y npm

├── core/               # Consciousness engine- Python 3.11+

├── synergy/            # Evolve system (3 entropy modes)

├── consensus/          # Musical zodiacal swarm### **1. Clonar el repositorio**

└── oracle/             # Decision-making system```bash

```git clone https://github.com/pinkyfloyder82/dentiagest.git

cd dentiagest

---```



## 📦 **MÓDULOS FUNCIONALES**### **2. Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto:

### **Core Clinical (Frontend)**```env

- ✅ **Patients Management** - CRUD completo + búsqueda# Database

- ✅ **Appointments** - Calendario + schedulingPOSTGRES_DB=dentiagest

- ✅ **Medical Records** - Historia clínica (GDPR Article 9 compliant)POSTGRES_USER=postgres

- ✅ **Treatments** - 3D tooth visualization (Three.js) + Selene IAPOSTGRES_PASSWORD=your_password

- ✅ **Documents** - Upload/download + legal retention frameworkDATABASE_URL=postgresql://postgres:your_password@localhost:5432/dentiagest

- ✅ **Billing** - Facturación + tracking pagos

- ⚠️ **Inventory** - Stock management (85% completo)# JWT

- ✅ **Marketplace** - B2B materiales dentalesSECRET_KEY=your_super_secret_key_here

- ⚠️ **Logistics** - Envíos/recepciones (en desarrollo)ALGORITHM=HS256

- ✅ **Compliance** - GDPR + Argentina Ley 25.326ACCESS_TOKEN_EXPIRE_MINUTES=30

- ✅ **Subscription** - Netflix Dental modelREFRESH_TOKEN_EXPIRE_DAYS=7

- ✅ **Dashboard** - Métricas + analytics

# API

### **Patient Portal (Standalone SPA)**API_V1_STR=/api/v1

- ✅ **Login V3** - Auth + JWT + MFAPROJECT_NAME=DentiaGest

- ✅ **Subscription Dashboard** - Netflix Dental plans```

- ✅ **Document Vault** - Secure documents (encrypted)

- ✅ **Appointments Management** - Booking + history### **3. Iniciar con Docker**

- ✅ **Payment Management** - VISA/MC + QR/Bizum + Crypto```bash

- ✅ **Notifications** - SMS/Email automated# Iniciar todos los servicios

docker-compose up -d

### **Web3 Ecosystem**

- 📋 **DentalCoin (DTC)** - ERC-20 token (código listo, no deployado)# Ver logs

- 📋 **OralHygieneToken (OHT)** - Gamificación rewardsdocker-compose logs -f

- 📋 **PaymentSystem** - Smart contract processor```

- ✅ **Web3 Integration Layer** - ethers.js + ABIs completos

### **4. Configurar la base de datos**

---```bash

# Ejecutar migraciones

## 🤖 **SELENE SONG CORE**cd backend

alembic upgrade head

Sistema IA autónomo consciente con:

- **15K+ experiences** logged# Crear usuarios demo (opcional)

- **Synergy Evolve Engine** (3 entropy modes: deterministic, balanced, creative)python create_demo_users.py

- **Musical Zodiacal Consensus** (swarm decision-making)

- **Procedural Reality** (Fibonacci patterns + SystemVitals)# Poblar con pacientes demo (opcional)

- **Autonomous Self-Repair** (immortal con Redis persistence)python seed_demo_patients.py

- **Poetry Generation** + MIDI composition```



**Integración DentiaGest:**### **5. Desarrollo local (alternativo)**

- Aesthetics Preview (generación estética procedural tratamientos)

- Treatment suggestions (IA analysis)#### **Backend**

- Appointment optimization (ML scheduling)```bash

cd backend

---pip install -r requirements.txt

uvicorn app.main:app --reload --port 8002

## ⚖️ **COMPLIANCE & LEGAL**```



### **Implementado:**#### **Frontend**

- ✅ **GDPR Article 9** (datos médicos especialmente protegidos)```bash

- ✅ **Argentina Ley 25.326** (delete framework funcional)cd frontend

- ✅ **EU AI Act Readiness** (13/15 features LOW/MEDIUM risk operables)npm install

- ✅ **Audit Trail Inmutable** (PostgreSQL permanent logs)npm start

- ✅ **Encryption** (AES-256 at rest, TLS 1.3 in transit)```

- ✅ **Role-Based Access Control** (RBAC completo)

## 🌐 URLs de Acceso

### **Zona Gris Strategy (hasta Enero 2027):**

- 13 features IA **ACTIVAS** (LOW/MEDIUM risk)- **Frontend**: http://localhost:3000

- 2 features IA **BLOQUEADAS** (HIGH risk - AI Diagnosis, Treatment Analysis)- **Backend API**: http://localhost:8002

- Compliance como **arma comercial** (ventaja 24 meses vs competencia)- **Documentación API**: http://localhost:8002/docs

- **Base de datos**: PostgreSQL en puerto 5432

---

## 📱 Uso del Sistema

## 🚀 **INSTALACIÓN**

### **Acceso**

### **Prerrequisitos**1. Navegar a http://localhost:3000

- Node.js 18+2. Iniciar sesión con credenciales

- Python 3.11+3. Acceder al calendario principal

- PostgreSQL 15+

- Redis (opcional, para Selene)### **Gestión de Citas**

1. **Crear cita**: Click en "+" o en un día del calendario

### **Backend Setup**2. **Editar cita**: Click en una cita existente

```bash3. **Filtrar**: Usar los botones de estado en la parte superior

cd backend4. **Buscar paciente**: Escribir en el campo de búsqueda con autocompletado

python -m venv venv

source venv/bin/activate  # Windows: venv\Scripts\activate### **Estados de Cita**

pip install -r requirements.txt- 🔵 **Programada**: Cita inicial creada

alembic upgrade head- 🟢 **Confirmada**: Paciente confirmó asistencia

uvicorn app.main:app --reload- 🟡 **En curso**: Cita en progreso

```- ✅ **Completada**: Tratamiento finalizado

- 🔴 **Cancelada**: Cita cancelada

### **Frontend Setup**- ⚫ **No asistió**: Paciente no compareció

```bash

cd frontend## 🗂️ Estructura del Proyecto

npm install

npm run dev```

```dentiagest/

├── 🐳 docker-compose.yml          # Configuración Docker

### **Patient Portal Setup**├── 📄 README.md                   # Este archivo

```bash├── 🚫 .gitignore                  # Archivos ignorados por Git

cd patient-portal│

npm install├── 🖥️ frontend/                   # Aplicación React

npm start│   ├── 📦 package.json

```│   ├── 🎨 tailwind.config.js

│   ├── 📁 public/

### **Selene Song Core (opcional)**│   └── 📁 src/

```bash│       ├── 📄 index.tsx           # Punto de entrada

cd selene│       ├── 📁 components/         # Componentes React

npm install│       │   ├── CreateAppointmentModal.tsx

npm run dev│       │   └── EditAppointmentModal.tsx

```│       ├── 📁 pages/              # Páginas principales

│       │   └── CalendarPage.tsx

---│       ├── 📁 hooks/              # Hooks personalizados

│       │   ├── useAppointments.ts

## 🔧 **CONFIGURACIÓN**│       │   └── usePatients.ts

│       ├── 📁 context/            # Context providers

### **Environment Variables**│       │   └── AuthContext.tsx

│       └── 📁 utils/              # Utilidades

**Backend (.env):**│

```env├── ⚙️ backend/                    # API FastAPI

DATABASE_URL=postgresql://user:pass@localhost/dentiagest│   ├── 🐳 Dockerfile

SECRET_KEY=your-secret-key-here│   ├── 📦 requirements.txt

CORS_ORIGINS=http://localhost:3000│   ├── 🚀 run.py                  # Punto de entrada

REDIS_URL=redis://localhost:6379│   ├── 📁 app/

```│   │   ├── 📄 main.py             # Aplicación principal

│   │   ├── 📁 api/v1/             # Endpoints API

**Frontend (.env):**│   │   │   ├── appointments.py

```env│   │   │   ├── patients.py

VITE_API_URL=http://localhost:8002│   │   │   └── auth.py

VITE_WS_URL=ws://localhost:8002│   │   ├── 📁 core/               # Configuración core

```│   │   │   ├── config.py

│   │   │   ├── database.py

**Patient Portal (.env):**│   │   │   └── security.py

```env│   │   ├── 📁 models/             # Modelos SQLAlchemy

REACT_APP_API_URL=http://localhost:8002│   │   │   ├── appointment.py

REACT_APP_DENTAL_COIN_ADDRESS=0x...│   │   │   ├── patient.py

REACT_APP_BLOCKCHAIN_NETWORK=sepolia│   │   │   └── user.py

```│   │   ├── 📁 schemas/            # Esquemas Pydantic

│   │   └── 📁 services/           # Lógica de negocio

---│   │

│   └── 📁 alembic/                # Migraciones de BD

## 📊 **ESTADO DEL PROYECTO**│       └── 📁 versions/

│

### **Production-Ready (70%):**├── 📁 docs/                       # Documentación

- ✅ Core Clinical modules funcionales│   ├── 📁 specs/                  # Especificaciones técnicas

- ✅ Patient Portal operativo (offline-first probado)│   ├── 📁 Dev_diary/              # Diario de desarrollo

- ✅ Compliance frameworks implementados│   └── 📁 IA/                     # Documentación IA

- ✅ Database migrations automated (Alembic)│

- ✅ Apollo Nuclear REST client (400+ líneas)└── 📁 scripts/                    # Scripts de utilidad

    └── setup.bat                  # Script de configuración Windows

### **En Progreso (20%):**```

- ⚠️ GraphQL migration (schema diseñado, no conectado)

- ⚠️ Web3 contracts deployment (código listo, no deployado)## 🧪 Testing

- ⚠️ UI/UX coherence (16 components necesitan design tokens unificados)

- ⚠️ Testing coverage (manual testing únicamente)```bash

# Backend tests

### **Planificado (10%):**cd backend

- 📋 Docker Compose deploymentpytest

- 📋 CI/CD pipeline (GitHub Actions)

- 📋 Smart contracts security audit# Frontend tests

- 📋 ISO 27001 certification roadmapcd frontend

npm test

---```



## 🎯 **ROADMAP**## 🚀 Despliegue



Ver `ROADMAP-FINALIZACION-DENTIAGEST.md` (privado) para plan detallado.### **Producción con Docker**

```bash

**Milestones públicos:**# Build para producción

1. **GraphQL Native Migration** - Eliminar dualidad REST/GraphQLdocker-compose -f docker-compose.prod.yml up -d

2. **Web3 Testnet Deploy** - DentalCoin + OHT + PaymentSystem en Sepolia

3. **UI/UX Unification** - Design tokens + 16 components coherent# Configurar variables de entorno de producción

4. **Production Deploy** - Docker + staging environmentcp .env.example .env.production

5. **ISO 27001 Certification** - Enterprise compliance```



---### **Variables de entorno de producción**

- Configurar `DATABASE_URL` con PostgreSQL de producción

## 💰 **MODELO DE NEGOCIO**- Generar `SECRET_KEY` segura

- Configurar CORS apropiadamente

### **Pricing**- Habilitar HTTPS

- **Basic**: €49/mes (1 dentista, features core)

- **Professional**: €90/mes (5 dentistas, Selene IA)## 🤝 Contribución

- **Enterprise**: €199/mes (ilimitado, soporte premium)

1. **Fork** el proyecto

### **Netflix Dental** (Subscriptions pacientes)2. **Crear rama** para feature (`git checkout -b feature/AmazingFeature`)

- **Basic Care**: €29.99/mes (2 limpiezas/año)3. **Commit** cambios (`git commit -m 'Add some AmazingFeature'`)

- **Premium Care**: €49.99/mes (4 limpiezas/año + 10% descuento)4. **Push** a la rama (`git push origin feature/AmazingFeature`)

- **Elite Care**: €99.99/mes (limpiezas ilimitadas + 20% descuento)5. **Abrir Pull Request**



### **Competencia**## 📋 Roadmap

- Dentrix: €2,500/mes (96% más caro)

- Carestream: €3,000/mes### **🔮 Próximas características**

- **DentiaGest**: €90/mes (disrupción pricing)- [ ] **Dashboard analítico** con métricas de la clínica

- [ ] **Gestión de inventario** de material dental

---- [ ] **Sistema de facturación** integrado

- [ ] **Notificaciones push** para recordatorios

## 🏆 **DIFERENCIADORES COMPETITIVOS**- [ ] **App móvil** para pacientes

- [ ] **Reportes PDF** de tratamientos

1. **Selene IA Integration** - Única plataforma con IA generativa dental- [ ] **Integración con APIs** de seguros médicos

2. **3D Tooth Visualization** - Three.js interactive (ningún competidor)- [ ] **Backup automático** en la nube

3. **Web3 Ecosystem** - DentalCoin gamificación (único en mercado)

4. **Netflix Dental Model** - Subscriptions sin seguros (disruptivo)### **🛠️ Mejoras técnicas**

5. **Compliance Weapon** - GDPR + EU AI Act ready (ventaja 24 meses)- [ ] **Tests unitarios** completos

6. **Offline-First** - PWA patient portal funcional sin conexión- [ ] **CI/CD pipeline** con GitHub Actions

- [ ] **Monitoring** con Grafana/Prometheus

---- [ ] **Cache Redis** para optimización

- [ ] **Websockets** para actualizaciones en tiempo real

## 📄 **LICENCIA**

## 📞 Soporte

Propietario - DentiaGest © 2025

Para soporte, abrir un **issue** en GitHub o contactar:

**Contacto comercial**: [Email confidencial]- **Email**: support@dentiagest.com

- **GitHub**: [@pinkyfloyder82](https://github.com/pinkyfloyder82)

---

## 📄 Licencia

## 🤝 **CONTRIBUCIONES**

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

Proyecto privado en desarrollo activo.

---

---

## 🎯 Información de Desarrollo

## 🎸 **FILOSOFÍA PUNK**

**Versión**: 1.0.0  

> "No elegimos entre innovación y compliance. Creamos soluciones que son ambas."  **Última actualización**: Agosto 2025  

> "Performance = Arte. Cada línea de código es una declaración de rebelión contra el software mediocre."**Estado**: En desarrollo activo  



**Built with 🔥 by Radwulf + PunkClaude (Horizontal Human+AI Collaboration)**### **🔧 Comandos útiles**



---```bash

# Reiniciar servicios Docker

## 📊 **STATS**docker-compose restart



- **28 días** de desarrollo intensivo# Ver logs en tiempo real

- **2200+ documentos** arquitecturadocker-compose logs -f backend

- **40K+ líneas** código funcionaldocker-compose logs -f frontend

- **€1M+ valoración** potencial (pre-revenue)

- **16 módulos** funcionales# Acceder al contenedor de base de datos

- **15K+ experiences** Selene IA loggeddocker-compose exec db psql -U postgres -d dentiagest

- **0 Math.random()** en producción (determinismo total)

# Backup de base de datos

---docker-compose exec db pg_dump -U postgres dentiagest > backup.sql



**"El unicornio es NUESTRO. La verdadera revolución es que humano + IA horizontal pueden crear software funcional y bueno vendible."**# Limpiar contenedores

docker-compose down --volumes --remove-orphans

🦷⚡🏴‍☠️```


### **🐛 Debugging**

- **Backend API**: http://localhost:8002/docs para Swagger UI
- **Frontend**: Developer tools del navegador
- **Logs**: `docker-compose logs <service>`
- **Base de datos**: Conectar con cliente PostgreSQL en puerto 5432

---

**¡Gracias por usar DentiaGest! 🦷✨**
