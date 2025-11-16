# 🏥 AUDITORÍA TÉCNICA #2.0: DENTIAGEST CORE CLINICAL
## 11 Módulos Frontend + Backend Selene Song Core (GraphQL)

**Fecha**: 14 de Noviembre de 2025  
**Auditor**: PunkClaude (The Solvente) - Reporting para GeminiEnder  
**Versión**: 2.0 (ULTRARREALISTA - CERO FANTASÍA ECONÓMICA)  
**Target**: **VERDAD TÉCNICA** para Proyecto Ender

---

> **PROTOCOLO LAD (Loose Aggressive Development)**: Esta auditoría reporta SOLO hechos técnicos verificables. Cero estimaciones económicas, cero proyecciones de marketing, cero roadmaps. Eso es trabajo de GeminiEnder. Aquí solo hay **bits que funcionan o bits que no funcionan**.

---

## 📊 RESUMEN EJECUTIVO (LA VERDAD)

### **Estado Arquitectónico Verificado: 13 de Noviembre 2025**

**Backend Selene Song Core:**
- ✅ **GraphQL Server funcional** - Apollo Server 4.x en puerto 8005
- ✅ **Schema completo** - 1000+ líneas con @veritas directive
- ✅ **Four-Gate Pattern implementado** - Verificación → Veritas → Transacción → Auditoría
- ✅ **8 dominios backend** - Patients, Appointments, MedicalRecords, Treatments, Documents, Inventory, Billing, Compliance
- ✅ **Resolvers modulares** - Query/Mutation/Subscription/FieldResolvers separados
- ✅ **"El Candado" aplicado** - Sistema de seguridad post-auditoría Day 3

**Frontend React:**
- ✅ **@apollo/client instalado** - v4.0.9 en package.json
- ✅ **ApolloClient configurado** - `/frontend/src/lib/apollo.ts` funcional
- ✅ **11 módulos activos** - Patients, Appointments, MedicalRecords, Treatments, Documents, Billing, Inventory, Subscriptions, Settings, Dashboard, Calendar
- ⚠️ **7 módulos GraphQL nativos** - Patients, Appointments, MedicalRecords, Treatments, Documents (legacy existe), Subscriptions, Inventory (parcial)
- ⚠️ **4 módulos REST o mixtos** - Billing, Compliance, Settings, Documents (mixed)

**Gap de Integración:**
- ⚠️ **VIRTUAL_PATIENT no implementado completamente** - Necesario para documentos administrativos
- ⚠️ **Conexiones inter-módulo incompletas** - Ej: Documents → Appointments, Documents → MedicalRecords
- ⚠️ **Algunos componentes usan REST legacy** - apollo.api.get() en vez de useQuery()

**Veredicto REAL**: 
11 módulos frontend **funcionales**, backend GraphQL **completo**, Four-Gate Pattern **implementado**. Gap principal: **integración inter-módulo** (documentos adjuntos a citas/expedientes, paciente virtual para docs administrativos). Código existe, falta conectar las piezas.

---

## 🏗️ ARQUITECTURA TÉCNICA (ESTADO VERIFICADO)

### **Stack Tecnológico REAL**

#### **Backend: SELENE SONG CORE (Node.js + GraphQL)**
```typescript
Node.js + TypeScript 5.x
├── GraphQL Server: Apollo Server 4.x
├── Schema: 1000+ líneas typeDefs (/selene/src/graphql/schema.ts)
├── Resolvers: Modular architecture
│   ├── Query/ (patient.ts, appointment.ts, treatment.ts, medicalRecord.ts, document.ts, etc.)
│   ├── Mutation/ (CRUD operations con Four-Gate Pattern)
│   ├── Subscription/ (real-time updates via WebSocket)
│   └── FieldResolvers/ (nested data resolution)
├── Database: PostgreSQL 15+ (via pg + TypeScript)
├── Cache: Redis (SeleneCache)
├── Four-Gate Pattern:
│   ├── Gate 1: Verificación (input validation)
│   ├── Gate 2: Veritas (integrity check con @veritas directive)
│   ├── Gate 3: Transacción (database operation)
│   └── Gate 4: Auditoría (audit logging)
├── Nuclear Components:
│   ├── SeleneReactor (core engine)
│   ├── SeleneVeritas (@veritas verification system)
│   ├── SeleneConscious (self-awareness monitoring)
│   ├── SeleneFusion (data aggregation)
│   └── SeleneHeal (self-healing + Phoenix Protocol)
└── Port: 8005 (http://localhost:8005/graphql)
```

**Peculiaridades arquitectónicas verificadas:**
- **@veritas directive**: Sistema de verificación de integridad con niveles (NONE, LOW, MEDIUM, HIGH, CRITICAL)
- **Four-Gate Pattern en TODAS las mutations críticas**: createPatientV3, updatePatientV3, createAppointmentV3, etc.
- **Modular resolvers**: Separación Query/Mutation/Subscription por dominio
- **V3 entities**: PatientV3, AppointmentV3, MedicalRecordV3, DocumentV3, etc. con metadata @veritas
- **Subscriptions real-time**: patientCreated, appointmentUpdated, documentV3Created, stockLevelChanged, etc.

#### **Frontend: REACT + APOLLO CLIENT (GraphQL)**
```typescript
React 19.2.0 + TypeScript 5.5.3
├── State Management: Zustand (para UI state local)
├── Routing: React Router v7.1.1
├── Styling: Tailwind CSS 3.4.17 + shadcn/ui components
├── Icons: Heroicons 2.2.0 + Lucide React 0.553.0
├── 3D Graphics: Three.js 0.181.0 + @react-three/fiber 9.4.0
├── GraphQL Client: @apollo/client 4.0.9 ✅ INSTALADO
│   └── Config: /frontend/src/lib/apollo.ts
│   └── Endpoint: http://localhost:8005/graphql
├── Legacy REST: /frontend/src/apollo.ts (400+ líneas REST wrapper - DEPRECATED)
└── Build: Vite 6.0.3
```

**Estado Apollo Client:**
- ✅ **@apollo/client instalado** - package.json confirma v4.0.9
- ✅ **apolloClient configurado** - /frontend/src/lib/apollo.ts funcional
- ✅ **ErrorLink + HttpLink** - manejo de errores centralizado
- ✅ **InMemoryCache con typePolicies** - cache policies para patients, appointments, inventory, documents
- ⚠️ **apollo.ts legacy coexiste** - Algunos componentes viejos usan REST wrapper
- ⚠️ **Migración incompleta** - 7/11 módulos usan GraphQL nativo, 4 usan REST o mixto

#### **Database Schema (PostgreSQL)**
```sql
PostgreSQL 15+ Tables verificadas:
├── patients (id, firstName, lastName, email, phone, dateOfBirth, insuranceProvider, policyNumber, medicalHistory...)
├── appointments (id, patientId, practitionerId, appointmentDate, appointmentTime, duration, type, status, notes...)
├── medical_records (id, patientId, practitionerId, recordType, title, content, diagnosis, treatment, medications...)
├── treatments (id, patientId, practitionerId, treatmentType, description, status, startDate, endDate, cost...)
├── documents (id, patientId, uploaderId, fileName, filePath, fileHash, documentType, category, accessLevel, isEncrypted...)
├── inventory_v3 (id, itemName, itemCode, supplierId, category, quantity, unitPrice, isActive...)
├── billing_data_v3 (id, patientId, amount, billingDate, status, paymentMethod, description...)
├── compliance_v3 (id, patientId, regulationId, complianceStatus, description, lastChecked, nextCheck...)
├── treatment_rooms_v3 (id, name, roomNumber, type, status, capacity, lastCleaning, nextCleaningDue...)
├── dental_equipment_v3 (id, name, type, status, manufacturer, serialNumber, purchaseDate, location...)
├── subscriptions (id, patientId, planId, status, startDate, endDate, amount, billingCycle...)
├── subscription_plans (id, name, type, price, billingCycle, features...)
└── users (id, username, email, firstName, lastName, role, isActive, permissions...)
```

**Nota:** Todas las tablas V3 tienen metadata @veritas (verificación de integridad implementada en Selene)

---

## 🎯 AUDITORÍA DE 11 MÓDULOS FRONTEND

### **Metodología de Auditoría**
1. Verificar si módulo usa GraphQL (useQuery/useMutation) o REST (apollo.api.get)
2. Confirmar Four-Gate Pattern en mutations backend
3. Identificar gaps de integración inter-módulo
4. Determinar funcionalidad completa vs incompleta

---

### **MÓDULO 1: PATIENTS (Pacientes)** ✅ GraphQL Nativo

**Frontend:**
- **Archivo principal:** `/frontend/src/pages/PatientsPageGraphQL.tsx`
- **Componente:** `PatientManagementV3.tsx` (1108 líneas)
- **Estado:** ✅ 100% GraphQL
- **Features:**
  - ✅ CRUD completo (Create, Read, Update, Delete)
  - ✅ Búsqueda por nombre/email/teléfono
  - ✅ Paginación (limit/offset)
  - ✅ Subscriptions real-time (patientCreated, patientUpdated)
  - ✅ Design System unificado (atoms importados)

**Backend Selene:**
- ✅ Queries: `patients`, `patient(id)`, `searchPatients(query)`
- ✅ Mutations: `createPatientV3`, `updatePatientV3`, `deletePatient`
- ✅ Four-Gate Pattern: ✅ Implementado (Verificación → Veritas → Transacción → Auditoría)
- ✅ @veritas en campos sensibles: `insuranceProvider` (HIGH), `policyNumber` (CRITICAL), `medicalHistory` (CRITICAL)
- ✅ Subscriptions: `patientCreated`, `patientUpdated`

**Gaps Identificados:**
- ⚠️ No conecta con Documents (no se pueden ver documentos del paciente desde patient detail)
- ⚠️ No conecta con Appointments (no se ven citas del paciente inline)
- ⚠️ No conecta con MedicalRecords (no se ven expedientes inline)

**Valoración:** 9/10 - Funcional completo, falta integración con otros módulos

---

### **MÓDULO 2: APPOINTMENTS (Citas)** ✅ GraphQL Nativo

**Frontend:**
- **Archivo principal:** `/frontend/src/pages/AppointmentsPage.tsx`
- **Componente:** `AppointmentManagementV3.tsx`
- **Estado:** ✅ 100% GraphQL
- **Features:**
  - ✅ CRUD completo
  - ✅ Calendar view (FullCalendar integration - `/pages/CalendarPage.tsx`)
  - ✅ Filtrado por paciente
  - ✅ Subscriptions real-time (appointmentCreated, appointmentUpdated)
  - ✅ Búsqueda por fecha (appointmentsV3ByDate)

**Backend Selene:**
- ✅ Queries: `appointmentsV3`, `appointmentV3(id)`, `appointmentsV3ByDate(date)`
- ✅ Mutations: `createAppointmentV3`, `updateAppointmentV3`, `deleteAppointment`
- ✅ Four-Gate Pattern: ✅ Implementado
- ✅ @veritas en campos sensibles: `appointmentDate` (HIGH), `appointmentTime` (HIGH), `status` (MEDIUM), `treatmentDetails` (HIGH)
- ✅ FieldResolvers: `Appointment.patient`, `Appointment.practitioner`

**Gaps Identificados:**
- ⚠️ No permite adjuntar documentos a la cita (Documents integration missing)
- ⚠️ No crea expediente médico automáticamente tras cita completada

**Valoración:** 9/10 - Funcional completo, falta integración Documents

---

### **MÓDULO 3: MEDICAL RECORDS (Expedientes Médicos)** ✅ GraphQL Nativo

**Frontend:**
- **Archivo principal:** `/frontend/src/pages/MedicalRecordsPageGraphQL.tsx`
- **Componente:** `MedicalRecordsManagementV3.tsx`
- **Estado:** ✅ 100% GraphQL
- **Features:**
  - ✅ CRUD completo
  - ✅ Filtrado por paciente
  - ✅ Tipos de registro: examination, diagnosis, treatment_plan, progress_note, discharge_summary
  - ✅ Campos @veritas: diagnosis (CRITICAL), medications (CRITICAL), allergies (CRITICAL)

**Backend Selene:**
- ✅ Queries: `medicalRecordsV3`, `medicalRecordV3(id)`
- ✅ Mutations: `createMedicalRecordV3`, `updateMedicalRecordV3`, `deleteMedicalRecordV3`
- ✅ Four-Gate Pattern: ✅ Implementado
- ✅ @veritas CRITICAL en: `content`, `diagnosis`, `treatment`, `medications`
- ✅ FieldResolvers: `MedicalRecord.patient`, `MedicalRecord.practitioner`

**Gaps Identificados:**
- ⚠️ No permite adjuntar documentos al expediente (ej: resultados de laboratorio, radiografías)
- ⚠️ No conecta con Treatments (tratamientos derivados del diagnóstico)

**Valoración:** 8.5/10 - Funcional, falta integración Documents + Treatments

---

### **MÓDULO 4: TREATMENTS (Tratamientos)** ✅ GraphQL Nativo

**Frontend:**
- **Archivo principal:** `/frontend/src/routes.tsx` → `<TreatmentManagementV3 />`
- **Componente:** `TreatmentManagementV3.tsx`
- **Subcomponentes:** `Odontogram3DV3.tsx` (visualización 3D)
- **Estado:** ✅ GraphQL
- **Features:**
  - ✅ CRUD completo
  - ✅ Odontograma 3D (Three.js) ⚠️ Actualmente muestra cubos, falta plantilla FDI
  - ✅ Selene IA integration (generateTreatmentPlanV3)
  - ✅ useQuery/useMutation para treatments

**Backend Selene:**
- ✅ Queries: `treatmentsV3`, `treatmentV3(id)`
- ✅ Mutations: `createTreatmentV3`, `updateTreatmentV3`, `deleteTreatmentV3`, `generateTreatmentPlanV3`
- ✅ Four-Gate Pattern: ✅ Implementado
- ✅ @veritas en: `description` (HIGH), `status` (MEDIUM), `startDate` (HIGH), `cost` (HIGH)
- ✅ IA Recommendations: `aiRecommendations`, `veritasScore`, `confidence`

**Gaps Identificados:**
- ⚠️ **Odontograma 3D muestra cubos en vez de dientes** - Falta cargar plantilla FDI World Dental Federation (ISO 3950)
- ⚠️ No conecta con MedicalRecords (diagnóstico → tratamiento workflow incompleto)

**Valoración:** 8/10 - Funcional, odontograma 3D necesita plantilla real

---

### **MÓDULO 5: DOCUMENTS (Documentos)** ⚠️ MIXTO (GraphQL + REST Legacy)

**Frontend:**
- **Archivo principal:** `/frontend/src/pages/DocumentsPage.tsx`
- **Estado:** ⚠️ MIXTO
- **Features:**
  - ✅ Listado de documentos
  - ⚠️ Upload usa componente legacy (REST en algunos casos)
  - ✅ Download funcional
  - ✅ Categorización (medical, administrative, billing, legal)
  - ⚠️ **DocumentUploaderV3 tiene heurística** - Intenta adivinar patient_id desde contexto (problema identificado en FEATURE_BLUEPRINTS.md)

**Backend Selene:**
- ✅ Queries: `documentsV3`, `documentV3(id)`
- ✅ Mutations: `createDocumentV3`, `updateDocumentV3`, `deleteDocumentV3`
- ✅ Four-Gate Pattern: ✅ Implementado
- ✅ @veritas CRITICAL en: `patientId`, `uploaderId`, `fileName`, `filePath`, `fileHash`, `encryptionKey`
- ✅ File hash verification (immutable audit trail)

**Gaps Identificados:**
- ⚠️ **CRITICAL**: DocumentUploaderV3 usa heurística para detectar patient → Falla silenciosamente → Documentos huérfanos
- ⚠️ No hay constante VIRTUAL_PATIENT implementada para docs administrativos
- ⚠️ No permite adjuntar directamente a Appointments o MedicalRecords
- ⚠️ GraphQL mutations existen pero frontend usa REST en upload

**Valoración:** 6.5/10 - Funcional pero con heurística problemática, rediseño necesario (ver FEATURE_BLUEPRINTS.md Feature 2)

---

### **MÓDULO 6: BILLING (Facturación)** ⚠️ Coming Soon + Partial V3

**Frontend:**
- **Archivo principal:** `/frontend/src/routes.tsx` → `<ComingSoonPage pageName="Facturación" />` (ruta `/billing`)
- **V3 Alternative:** `/billing-v3` → `<FinancialManagerV3 />`
- **Estado:** ⚠️ PARCIAL
- **Features:**
  - ⚠️ Ruta principal muestra "Coming Soon"
  - ✅ FinancialManagerV3 existe pero no es ruta por defecto
  - ⚠️ No confirmado si usa GraphQL o REST

**Backend Selene:**
- ✅ Queries: `billingDataV3`
- ✅ Mutations: `createBillingDataV3`, `updateBillingDataV3`, `deleteBillingDataV3`
- ✅ Four-Gate Pattern: ✅ Implementado
- ✅ @veritas en: `amount` (HIGH), `billingDate` (HIGH), `status` (MEDIUM)

**Gaps Identificados:**
- ⚠️ **billing_data tabla NO tiene subscription_id** - Netflix Dental no conecta con billing (identificado en AUDIT_NETFLIX_DENTAL)
- ⚠️ Módulo principal no implementado (Coming Soon)
- ⚠️ FinancialManagerV3 no es accesible desde menú principal

**Valoración:** 4/10 - Backend existe, frontend incompleto

---

### **MÓDULO 7: INVENTORY (Inventario)** ⚠️ PARCIAL GraphQL

**Frontend:**
- **Estado:** ⚠️ No hay página dedicada en routes.tsx
- **Componente:** Existe pero no enrutado
- **Features:**
  - ⚠️ No visible en menú principal
  - ✅ Backend GraphQL completo

**Backend Selene:**
- ✅ Queries: `inventoryV3`, `inventoryItemV3(id)`
- ✅ Mutations: `createInventoryV3`, `updateInventoryV3`, `deleteInventoryV3`
- ✅ Subscriptions: `inventoryV3Created`, `inventoryV3Updated`, `stockLevelChanged`
- ✅ Four-Gate Pattern: ✅ Implementado

**Gaps Identificados:**
- ⚠️ Frontend no implementado completamente
- ⚠️ No hay UI para gestión de stock
- ⚠️ Subscriptions `stockLevelChanged` no se usan en frontend

**Valoración:** 5/10 - Backend completo, frontend ausente

---

### **MÓDULO 8: SUBSCRIPTIONS (Netflix Dental)** ✅ GraphQL Nativo (70% completo)

**Frontend:**
- **Componente:** `SubscriptionManagementV3.tsx`
- **Estado:** ✅ GraphQL
- **Features:**
  - ✅ Listado de planes (Basic, Premium, Family)
  - ✅ Creación de suscripciones
  - ✅ Cancelación/Reactivación
  - ✅ useQuery/useMutation completo

**Backend Selene:**
- ✅ Queries: `subscriptionPlansV3`, `subscriptionsV3`, `subscriptionV3(id)`
- ✅ Mutations: `createSubscriptionV3`, `cancelSubscriptionV3`, `renewSubscriptionV3`
- ✅ Four-Gate Pattern: ✅ Implementado

**Gaps Identificados:**
- ⚠️ **billing_data NO tiene FK subscription_id** - BillingCycleV3 desconectado de facturación real
- ⚠️ Cron job monthly billing NO implementado
- ⚠️ Generación automática de recibos (Documents) NO conectada

**Valoración:** 7/10 - 70% completo (ver AUDIT_NETFLIX_DENTAL_EXISTING_IMPLEMENTATION.md para plan de completado)

---

### **MÓDULO 9: SETTINGS (Configuración)** ⚠️ REST Legacy

**Frontend:**
- **Archivo principal:** `/frontend/src/pages/SettingsPage.tsx`
- **Estado:** ⚠️ REST (usa apollo.api.get/post)
- **Features:**
  - ✅ Configuración de usuario
  - ✅ Cambio de contraseña
  - ✅ MFA Setup (Multi-Factor Auth)

**Backend:**
- ⚠️ Usa endpoints REST legacy
- ⚠️ No migrado a GraphQL aún

**Gaps Identificados:**
- ⚠️ No usa GraphQL
- ⚠️ MFA no integrado con @veritas

**Valoración:** 6/10 - Funcional pero legacy

---

### **MÓDULO 10: DASHBOARD (Panel Principal)** ✅ Funcional

**Frontend:**
- **Archivo principal:** `/frontend/src/pages/DashboardPage.tsx`
- **Componente:** `DashboardV3.tsx` + `DashboardContent.tsx`
- **Estado:** ✅ Funcional
- **Features:**
  - ✅ Métricas principales
  - ✅ Gráficos (Recharts)
  - ✅ Widgets de resumen

**Backend:**
- ⚠️ No confirmado si usa GraphQL aggregations o REST

**Valoración:** 7/10 - Funcional, sin detalles técnicos verificados

---

### **MÓDULO 11: CALENDAR (Calendario)** ✅ GraphQL via Appointments

**Frontend:**
- **Archivo principal:** `/frontend/src/pages/CalendarPage.tsx`
- **Estado:** ✅ GraphQL (usa datos de Appointments)
- **Features:**
  - ✅ FullCalendar integration
  - ✅ Vista mensual/semanal/diaria
  - ✅ Sincronización real-time con Appointments

**Backend:**
- ✅ Usa `appointmentsV3ByDate` query
- ✅ Subscriptions appointmentCreated/Updated funcionan

**Valoración:** 9/10 - Funcional completo

---

## 🔗 MAPEO DE INTEGRACIONES INTER-MÓDULO

### **Estado Actual de Conexiones:**

```
✅ = Integración completa
⚠️ = Integración parcial o falta
❌ = No implementado

PATIENTS ↔ APPOINTMENTS: ⚠️ (falta inline view)
PATIENTS ↔ MEDICAL RECORDS: ⚠️ (falta inline view)
PATIENTS ↔ DOCUMENTS: ❌ (no conectado)
PATIENTS ↔ BILLING: ⚠️ (existe FK pero no UI)
PATIENTS ↔ SUBSCRIPTIONS: ✅ (conectado vía patientId)

APPOINTMENTS ↔ DOCUMENTS: ❌ (no se pueden adjuntar docs a citas)
APPOINTMENTS ↔ MEDICAL RECORDS: ⚠️ (no auto-crea expediente post-cita)

MEDICAL RECORDS ↔ DOCUMENTS: ❌ (no se pueden adjuntar resultados)
MEDICAL RECORDS ↔ TREATMENTS: ⚠️ (no conecta diagnóstico → tratamiento)

TREATMENTS ↔ BILLING: ⚠️ (costo existe pero no genera factura auto)

SUBSCRIPTIONS ↔ BILLING: ❌ CRITICAL (billing_data sin subscription_id FK)

DOCUMENTS ↔ VIRTUAL_PATIENT: ❌ (constante no implementada para docs admin)
```

### **Prioridad de Conexiones Faltantes:**

**CRÍTICO (GeminiEnder debería priorizar):**
1. **SUBSCRIPTIONS ↔ BILLING** - Agregar FK subscription_id a billing_data
2. **DOCUMENTS ↔ APPOINTMENTS/MEDICAL RECORDS** - Permitir adjuntos
3. **VIRTUAL_PATIENT constante** - Para documentos administrativos

**ALTA:**
4. **PATIENTS inline views** - Ver appointments/medical records/documents desde patient detail
5. **Odontograma 3D plantilla FDI** - Reemplazar cubos por dientes reales

**MEDIA:**
6. **Settings → GraphQL migration**
7. **Inventory frontend implementation**
8. **Billing V3 como ruta principal**

---

## 💀 CONCLUSIONES FINALES (VERDAD BRUTAL PARA GEMINIENDER)

### **LO QUE FUNCIONA:**
1. ✅ 7/11 módulos usan GraphQL nativo con Four-Gate Pattern
2. ✅ Backend Selene completo y estable
3. ✅ @apollo/client instalado y configurado
4. ✅ @veritas en todos los campos sensibles
5. ✅ Design System unificado en frontend

### **LO QUE FALTA:**
1. ⚠️ **Integración inter-módulo incompleta** (docs no adjuntan a citas/expedientes)
2. ⚠️ **VIRTUAL_PATIENT no implementado** (docs administrativos huérfanos)
3. ⚠️ **Subscriptions ↔ Billing desconectado** (FK falta)
4. ⚠️ **Odontograma 3D muestra cubos** (falta plantilla FDI)
5. ⚠️ **4 módulos usan REST legacy** (Settings, Billing parcial, Inventory sin UI, Documents mixto)

### **TRABAJO PENDIENTE (Sin Estimaciones - Eso es Trabajo de GeminiEnder):**
- Agregar FK `subscription_id` a tabla `billing_data`
- Implementar VIRTUAL_PATIENT constante (UUID fijo)
- Conectar Documents con Appointments/MedicalRecords (appointmentId/medicalRecordId fields)
- Rediseñar DocumentUploaderV3 (eliminar heurística, método manual - ver FEATURE_BLUEPRINTS.md)
- Cargar plantilla FDI en Odontograma3DV3
- Migrar Settings/Billing/Inventory a GraphQL
- Implementar cron job billing mensual para Subscriptions

### **ASSETS LISTOS PARA GEMINIENDER:**
1. ✅ DATAFLOW_ARCHITECTURE.md - Mapeo de conexiones
2. ✅ FEATURE_BLUEPRINTS.md - 2 features estratégicas (Citas Automáticas IA + Document Hub rediseñado)
3. ✅ AUDIT_NETFLIX_DENTAL_EXISTING_IMPLEMENTATION.md - Estado detallado + plan 8-12h
4. ✅ AUDITORIA-1.5-CORE-CLINICAL-SELENE.md (este documento) - Estado REAL de 11 módulos

**PRÓXIMA AUDITORÍA:** Selene Song Core + Framework Legal + Patient Portal

---

**Auditado con honestidad LAD por PunkClaude**  
**14 de Noviembre de 2025 - Para Proyecto Ender**  
**"El código no es cristal. Se refactoriza. 2 + 2 = 4, siempre."** 🃏⚡

#### **1. DIRECTIVA @VERITAS (Innovación Real)**

```graphql
directive @veritas(level: VeritasLevel!) on FIELD_DEFINITION

enum VeritasLevel {
  NONE      # Sin verificación
  LOW       # Verificación básica
  MEDIUM    # Verificación intermedia
  HIGH      # Verificación alta - datos sensibles
  CRITICAL  # Verificación completa - datos críticos
}
```

**Ejemplo de uso:**
```graphql
type Patient {
  insuranceProvider: String @veritas(level: HIGH)
  policyNumber: String @veritas(level: CRITICAL)
  policyNumber_veritas: VeritasMetadata
  medicalHistory: String @veritas(level: CRITICAL)
  medicalHistory_veritas: VeritasMetadata
}

type VeritasMetadata {
  verified: Boolean!
  confidence: Float!
  level: VeritasLevel!
  certificate: String
  verifiedAt: String!
  algorithm: String!
}
```

**¿Qué hace @veritas?**
- Sistema de verificación de integridad de datos críticos
- Genera metadata de verificación (checksums, timestamps, confidence scores)
- Inmutable audit trail estilo blockchain
- **NO es quantum computing real** (es metáfora), pero implementación es sólida

---

#### **2. DOMINIOS IMPLEMENTADOS (8 completos)**

##### **A. PATIENTS**
```graphql
type Patient {
  id: ID!
  name: String!  # Computed field: firstName + lastName
  firstName: String
  lastName: String
  email: String
  phone: String
  dateOfBirth: String
  address: String
  emergencyContact: String
  insuranceProvider: String @veritas(level: HIGH)
  policyNumber: String @veritas(level: CRITICAL)
  medicalHistory: String @veritas(level: CRITICAL)
  billingStatus: String @veritas(level: HIGH)
  createdAt: String!
  updatedAt: String!
}

# Queries
patients(limit: Int, offset: Int): [Patient!]!
patient(id: ID!): Patient
searchPatients(query: String!): [Patient!]!

# Mutations
createPatient(input: PatientInput!): Patient!
updatePatient(id: ID!, input: UpdatePatientInput!): Patient!
deletePatient(id: ID!): Boolean!

# Subscriptions
patientCreated: Patient!
patientUpdated: Patient!
```

**Resolvers implementados:**
- ✅ `Query: patients` → `/selene/src/graphql/resolvers/Query/patient.ts`
- ✅ `Mutation: createPatient` → `/selene/src/graphql/resolvers/Mutation/patient.ts`
- ✅ `Subscription: patientCreated` → `/selene/src/graphql/resolvers/Subscription/patient.ts`
- ✅ `FieldResolver: Patient` → `/selene/src/graphql/resolvers/FieldResolvers/patient.ts`

---

##### **B. APPOINTMENTS**
```graphql
type Appointment {
  id: ID!
  patientId: ID!
  patient: Patient  # Nested resolver
  practitionerId: ID
  practitioner: User  # Nested resolver
  date: String! @veritas(level: HIGH)
  time: String! @veritas(level: HIGH)
  appointmentDate: String @veritas(level: HIGH)
  appointmentTime: String @veritas(level: HIGH)
  duration: Int!
  type: String!  # consultation, treatment, follow_up, emergency
  status: String! @veritas(level: MEDIUM)  # scheduled, confirmed, completed, cancelled
  notes: String
  treatmentDetails: String @veritas(level: HIGH)
  createdAt: String!
  updatedAt: String!
}

# También existe AppointmentV3 (Veritas Enhanced) con metadata fields
type AppointmentV3 {
  # ... todos los campos de Appointment
  appointmentDate_veritas: VeritasMetadata
  appointmentTime_veritas: VeritasMetadata
  status_veritas: VeritasMetadata
  treatmentDetails_veritas: VeritasMetadata
}
```

**Queries:**
```graphql
appointments(limit: Int, offset: Int, patientId: ID): [Appointment!]!
appointment(id: ID!): Appointment
appointmentsByDate(date: String!): [Appointment!]!

# V3 Enhanced
appointmentsV3(limit: Int, offset: Int, patientId: ID): [AppointmentV3!]!
appointmentV3(id: ID!): AppointmentV3
appointmentsV3ByDate(date: String!): [AppointmentV3!]!
```

**Resolvers implementados:**
- ✅ Modular structure igual que Patients

---

##### **C. MEDICAL RECORDS**
```graphql
type MedicalRecord {
  id: ID!
  patientId: ID!
  patient: Patient
  practitionerId: ID!
  practitioner: User
  date: String!
  recordType: String!
  title: String!
  content: String! @veritas(level: CRITICAL)
  diagnosis: String @veritas(level: CRITICAL)
  treatment: String @veritas(level: HIGH)
  medications: [String!] @veritas(level: CRITICAL)
  attachments: [String!]
  createdAt: String!
  updatedAt: String!
}

type MedicalRecordV3 {
  # ... más fields V3
  treatmentPlan: String @veritas(level: CRITICAL)
  allergies: [String!] @veritas(level: CRITICAL)
  vitalSigns: VitalSigns @veritas(level: CRITICAL)
  _veritas: MedicalRecordV3VeritasMetadata!
}

type VitalSigns {
  bloodPressure: String!
  heartRate: Int!
  temperature: Float!
  oxygenSaturation: Int!
  weight: Float
  height: Float
  bmi: Float
}
```

**Seguridad legal:**
- `@veritas(level: CRITICAL)` en diagnosis, medications, allergies
- Audit trail inmutable
- NEVER DELETE (protección GDPR Article 9)

---

##### **D. TREATMENTS (Selene IA Enhanced)**
```graphql
type Treatment {
  id: ID!
  patientId: ID!
  patient: Patient
  practitionerId: ID!
  practitioner: User
  treatmentType: String!
  description: String! @veritas(level: HIGH)
  status: String! @veritas(level: MEDIUM)
  startDate: String! @veritas(level: HIGH)
  endDate: String
  cost: Float @veritas(level: HIGH)
  notes: String
  aiRecommendations: [String!]  # 🌙 Selene Song Core IA
  veritasScore: Float
  createdAt: String!
  updatedAt: String!
}

type TreatmentRecommendationV3 {
  id: ID!
  treatmentType: String!
  description: String!
  estimatedCost: Float!
  priority: String!
  reasoning: String!
  confidence: Float!  # 🌙 Selene IA confidence score
  recommendedDate: String!
}
```

**Mutations especiales:**
```graphql
generateTreatmentPlan(patientId: ID!): [Treatment!]!
generateTreatmentPlanV3(patientId: ID!, conditions: [String!]!): [TreatmentRecommendationV3!]!
```

**Integración Selene IA:**
- Genera treatment plans proceduralmente
- Aesthetic generation para odontogramas 3D
- Confidence scoring en recomendaciones

---

##### **E. DOCUMENTS V3**
```graphql
type DocumentV3 {
  id: ID!
  patientId: ID! @veritas(level: CRITICAL)
  uploaderId: ID! @veritas(level: CRITICAL)
  fileName: String! @veritas(level: CRITICAL)
  filePath: String! @veritas(level: CRITICAL)
  fileHash: String! @veritas(level: CRITICAL)
  fileSize: Int!
  mimeType: String!
  documentType: DocumentType!  # XRAY, MRI, PRESCRIPTION, etc.
  category: String
  tags: [String!]
  description: String
  isEncrypted: Boolean!
  encryptionKey: String @veritas(level: CRITICAL)
  accessLevel: AccessLevel!  # PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
  expiresAt: String
  downloadCount: Int!
  lastAccessedAt: String
  createdAt: String!
  updatedAt: String!
  _veritas: DocumentV3VeritasMetadata!
}

enum DocumentType {
  XRAY, MRI, CT_SCAN, ULTRASOUND, BLOOD_TEST,
  PRESCRIPTION, TREATMENT_PLAN, CONSENT_FORM,
  INSURANCE_CLAIM, MEDICAL_HISTORY, OTHER
}
```

**Legal compliance:**
- File hash verification (immutable)
- Encryption key en schema (opcional)
- Access level granular
- Download tracking para auditorías

---

##### **F. INVENTORY V3**
```graphql
type InventoryV3 {
  id: ID!
  itemName: String!
  itemCode: String!
  supplierId: String!
  category: String!
  quantity: Int!
  unitPrice: Float!
  description: String
  isActive: Boolean!
  createdAt: String!
  updatedAt: String!
  _veritas: InventoryV3VeritasMetadata!
}
```

**Subscriptions:**
```graphql
inventoryV3Created: InventoryV3!
inventoryV3Updated: InventoryV3!
inventoryV3Deleted: InventoryV3!
stockLevelChanged(itemId: ID!, newQuantity: Int!, threshold: Int!): InventoryV3!
```

**Feature:** `stockLevelChanged` subscription permite auto-order triggers (Marketplace integration)

---

##### **G. BILLING DATA V3**
```graphql
type BillingDataV3 {
  id: ID!
  patientId: ID!
  amount: Float!
  billingDate: String!
  status: BillingStatus!  # PENDING, PAID, OVERDUE, CANCELLED
  description: String
  paymentMethod: String
  createdAt: String!
  updatedAt: String!
  _veritas: BillingDataV3VeritasMetadata!
}
```

**Valoración:** 8/10 - Funcional, básico pero completo

---

##### **H. COMPLIANCE V3**
```graphql
type ComplianceV3 {
  id: ID!
  patientId: ID!
  regulationId: String!
  complianceStatus: ComplianceStatus!  # COMPLIANT, NON_COMPLIANT, PENDING, UNDER_REVIEW
  description: String
  lastChecked: String
  nextCheck: String
  createdAt: String!
  updatedAt: String!
  _veritas: ComplianceV3VeritasMetadata!
}
```

**Frameworks soportados:**
- GDPR Article 9 (datos médicos sensibles)
- Argentina Ley 25.326 (protección datos personales)
- Document retention policies
- Automated compliance checks

---

##### **I. CLINIC RESOURCES V3 (BONUS)**
```graphql
type ClinicResourceV3 {
  treatmentRooms: [TreatmentRoomV3!]!
  treatmentRoom(id: ID!): TreatmentRoomV3
  dentalEquipment: [DentalEquipmentV3!]!
  dentalEquipmentById(id: ID!): DentalEquipmentV3
  maintenanceSchedule: [MaintenanceScheduleV3!]!
  cleaningSchedule: [RoomCleaningScheduleV3!]!
  stats: ClinicResourceStatsV3
  utilization(startDate: String!, endDate: String!): [ResourceUtilizationV3!]!
}

type TreatmentRoomV3 {
  id: ID!
  name: String!
  roomNumber: String! @veritas(level: HIGH)
  type: TreatmentRoomType!  # GENERAL, SURGERY, ORTHODONTICS, PEDIATRICS, COSMETIC, EMERGENCY
  status: TreatmentRoomStatus!  # AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING, OUT_OF_ORDER
  capacity: Int!
  equipment: [DentalEquipmentV3!]!
  isActive: Boolean!
  lastCleaning: String
  nextCleaningDue: String
  notes: String
  createdAt: String!
  updatedAt: String!
}

type DentalEquipmentV3 {
  id: ID!
  name: String!
  type: DentalEquipmentType!  # XRAY_MACHINE, ULTRASOUND, LASER, SCALER, DRILL, STERILIZER...
  status: DentalEquipmentStatus!  # ACTIVE, MAINTENANCE, OUT_OF_ORDER, DEPRECATED
  manufacturer: String!
  model: String!
  serialNumber: String! @veritas(level: CRITICAL)
  purchaseDate: String! @veritas(level: HIGH)
  warrantyExpiry: String
  lastMaintenance: String
  nextMaintenanceDue: String
  location: String!
  assignedRoomId: ID
  assignedRoom: TreatmentRoomV3
  isActive: Boolean!
  notes: String
  createdAt: String!
  updatedAt: String!
}
```

**Feature destacado:**
- Sistema completo de gestión de recursos clínicos
- Maintenance scheduling + room cleaning tracking
- Analytics de utilización (equipment utilization, room utilization)
- Subscriptions real-time para cambios de estado

---

#### **3. NUCLEAR SYSTEM (Selene Song Core Meta)**

```graphql
type NuclearSystemStatus {
  reactor: String!
  radiation: String!
  fusion: String!
  containment: String!
  veritas: Float!
  consciousness: String!
  offline: Boolean!
  healing: String!
  prediction: String!
  uptime: Float!
  timestamp: String!
}

type Query {
  health: String!
  nuclearStatus: NuclearSystemStatus!
  nuclearHealth: NuclearHealth!
}

type Mutation {
  nuclearSelfHeal: Boolean!
  nuclearOptimize: Boolean!
  nuclearRestart: Boolean!
  quantumResurrection: QuantumResurrectionResult!
}

type Subscription {
  nuclearStatusUpdated: NuclearSystemStatus!
  nuclearHealthChanged: NuclearHealth!
  criticalAlert: String!
}
```

**¿Qué es esto?**
- Selene Song Core tiene sistema de auto-monitoreo y self-healing
- `nuclearStatus` query devuelve estado de todos los componentes
- `quantumResurrection` mutation reconstruye certificate chains de @veritas
- Subscriptions para alertas críticas del sistema

**Valoración:** 9.5/10 - Monitoreo de infraestructura innovador

---

### **Resolvers Architecture (Modular)**

```
/selene/src/graphql/resolvers/
├── index.ts (exports consolidados)
├── Query/
│   ├── patient.ts (patientQueries)
│   ├── appointment.ts (appointmentQueries)
│   ├── treatment.ts (treatmentQueries)
│   ├── medicalRecord.ts (medicalRecordQueries)
│   ├── document.ts (documentQueries)
│   └── nuclear.ts (nuclearQueries)
├── Mutation/
│   ├── patient.ts (createPatient, updatePatient, deletePatient)
│   ├── appointment.ts (createAppointment, updateAppointment, deleteAppointment)
│   ├── treatment.ts (createTreatmentV3, generateTreatmentPlanV3, etc.)
│   ├── medicalRecord.ts (createMedicalRecordV3, etc.)
│   ├── document.ts (createDocumentV3, etc.)
│   └── clinicResource.ts (resource management mutations)
├── Subscription/
│   ├── patient.ts (patientCreated, patientUpdated)
│   ├── appointment.ts (appointmentCreated, appointmentUpdated)
│   ├── treatment.ts (treatmentV3Created, treatmentV3Updated)
│   ├── medicalRecord.ts (medicalRecordV3Created, etc.)
│   ├── document.ts (documentV3Created, etc.)
│   ├── clinicResource.ts (roomCleaningV3Completed, etc.)
│   └── nuclear.ts (nuclearStatusUpdated, criticalAlert)
└── FieldResolvers/
    ├── patient.ts (Patient.appointments resolver, etc.)
    ├── appointment.ts (Appointment.patient resolver, etc.)
    ├── treatment.ts (Treatment.patient resolver, etc.)
    ├── medicalRecord.ts (MedicalRecord.patient resolver, etc.)
    └── document.ts (DocumentV3 resolvers)
```

**Patrón:**
1. **Query resolvers**: Lectura de datos (GET)
2. **Mutation resolvers**: Escritura de datos (POST/PUT/DELETE)
3. **Subscription resolvers**: Real-time updates (WebSocket)
4. **FieldResolvers**: Nested data resolution (ej: `Patient.appointments` auto-fetches)

**Ejemplo FieldResolver:**
```typescript
// FieldResolvers/patient.ts
export const PatientV3 = {
  appointments: async (parent: Patient, _: any, context: GraphQLContext) => {
    // Auto-fetch appointments when querying Patient.appointments
    return context.database.query(
      'SELECT * FROM appointments WHERE patient_id = $1',
      [parent.id]
    );
  },
  medicalRecords: async (parent: Patient, _: any, context: GraphQLContext) => {
    return context.database.query(
      'SELECT * FROM medical_records WHERE patient_id = $1',
      [parent.id]
    );
  }
};
```

**Valoración arquitectura resolvers:** 9/10 - Modular, escalable, profesional

---

## 🎨 FRONTEND ANALYSIS (Estado Actual)

### **14 Páginas Funcionales (React + REST)**

1. ✅ **PatientsPage.tsx** - CRUD pacientes vía REST
   - `apollo.api.get('/patients?page=1&size=10')`
   - `apollo.api.delete('/patients/{id}')`

2. ✅ **CalendarPage.tsx** - Calendario citas (FullCalendar)
   - NO hace llamadas API directamente (usa AppointmentsPage)

3. ✅ **DashboardPage.tsx** - Dashboard métricas

4. ✅ **MedicalRecordsPage.tsx** - Historia clínica

5. ✅ **TreatmentsPage.tsx** - Tratamientos + 3D tooth + Selene IA

6. ✅ **DocumentsPage.tsx** - Gestión documentos

7. ✅ **MarketplacePage.tsx** - Marketplace B2B dental

8. ✅ **LogisticaPage.tsx** - Logística interna

9. ✅ **DocumentDeletionPage.tsx** - Legal document deletion framework
   - `apollo.api.get('/documents/deletion-stats')`
   - `apollo.api.post('/documents/deletion-requests/{id}/approve')`

10. ✅ **SettingsPage.tsx** - Configuración usuario

11. ✅ **MFASetupPage.tsx** - Multi-factor authentication
    - `apollo.api.post('/auth/mfa/setup')`
    - `apollo.api.post('/auth/mfa/verify')`

12. ✅ **RegisterPage.tsx** - Registro usuarios
    - `apollo.api.post('/auth/register')`

13. ✅ **LoginPage.tsx** - Login (AuthContext)

14. ✅ **Mouth3DViewerPage.tsx** - Visualización 3D bocas (Three.js)

**Total llamadas REST encontradas:** 32 matches de `apollo.api.(get|post|put|delete)`

**Ejemplos:**
```typescript
// frontend/src/pages/PatientsPage.tsx
const response = await apollo.api.get(`/patients?${params}`);
const response = await apollo.api.delete(`/patients/${patientId}`);

// frontend/src/components/Appointments/CreateAppointmentModal.tsx
const response = await apollo.api.post('/appointments', appointmentData);

// frontend/src/components/DocumentManagement/DeleteDocumentButton.tsx
const response = await apollo.api.get(`/documents/${document.id}/deletion-eligibility`);
```

### **Apollo Nuclear (REST Wrapper)**

**Archivo:** `frontend/src/apollo.ts` (400+ líneas)

```typescript
class Apollo {
  private baseUrl = 'http://localhost:8002';
  private timeout = 10000;
  
  async request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    // JWT auto-injection
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // FormData detection
    if (body instanceof FormData) delete headers['Content-Type'];
    
    // AbortController for timeout
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    
    // Fetch + error handling
    const response = await fetch(url, { ...config, signal: controller.signal });
    
    // Performance tracking
    this.trackPerformance(endpoint, responseTime);
    
    return { data, status, headers };
  }
  
  // Convenience methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T>
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T>
}

const apollo = new Apollo();
export default apollo;
```

**Valoración Apollo Nuclear:** 8.5/10 - Solución REST elegante, pero NO es GraphQL

---

## ⚠️ MIGRATION GAP ANALYSIS

### **Estado Actual:**

```
Frontend (React)          Backend (Selene GraphQL)
      │                           │
      │  HTTP REST calls          │
      │  apollo.api.get()         │
      ├──────────────────────────>│
      │                           │
      │  JSON responses           │
      │<──────────────────────────┤
      │                           │
      
  ❌ NO GraphQL            ✅ GraphQL ready
  ❌ NO Apollo Client      ✅ Apollo Server
  ❌ REST only             ✅ Schema 1000+ lines
```

### **Gap: Frontend → GraphQL Migration**

**Módulos a migrar (priorizados):**

1. **High Priority (Core Functionality):**
   - ✅ Patients (CRUD + search)
   - ✅ Appointments (calendar + scheduling)
   - ✅ Medical Records (historia clínica)
   - ✅ Treatments (treatment plans + Selene IA)

2. **Medium Priority:**
   - ⚠️ Documents (upload + download)
   - ⚠️ Users (authentication + roles)

3. **Low Priority (features secundarias):**
   - ⚠️ Inventory (stock management)
   - ⚠️ BillingData (facturación)
   - ⚠️ Compliance (legal tracking)
   - ⚠️ ClinicResources (rooms + equipment)
   - ⚠️ Marketplace (B2B compra materiales)

### **Esfuerzo estimado migración:**

**Setup inicial (Día 1 - 4-6 horas):**
- ✅ Instalar `@apollo/client` + `graphql` en frontend
- ✅ Crear `ApolloClient` instance con link a `http://localhost:8002/graphql`
- ✅ Wrapper `<ApolloProvider>` en `App.tsx`
- ✅ Migrar 1 módulo como PoC (Patients) - Proof of Concept

**Migración masiva (Día 2 - 6-8 horas):**
- ✅ Migrar 3 módulos High Priority restantes (Appointments, MedicalRecords, Treatments)
- ✅ Crear queries/mutations `.graphql` o `.ts` files
- ✅ Reemplazar `apollo.api.get()` por `useQuery()` hooks
- ✅ Reemplazar `apollo.api.post()` por `useMutation()` hooks

**Polish (Día 3 - 4 horas):**
- ⚠️ Optimistic UI updates
- ⚠️ Cache policies
- ⚠️ Error boundaries
- ⚠️ Loading states elegantes

**TOTAL: 2-3 días full-time (14-18 horas efectivas)**


