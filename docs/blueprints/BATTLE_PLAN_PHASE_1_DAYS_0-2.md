# ⚔️ BATTLE PLAN PHASE 1: DAYS 0-2
## DENTIAGEST FINALIZATION - GRAPHQL + SELENE INTEGRATION

**Fecha Inicio**: 6 Noviembre 2025  
**Arquitecto**: PunkClaude + Radwulf IQ 182  
**Ejecutor**: PunkGrok (40K líneas/5min) + Manual Refinement  
**Soundtrack**: Carpenter Brut 70% → 90%  
**Combustible**: 2L café frío + luces neón  

---

> **FILOSOFÍA**: Sin horas estimadas. Synergy Engine 14 semanas → 3 horas real. DentiaGest 28 días TOTAL (3 días Selene, resto DentiaGest + distracciones artísticas 😂). La IA horizontal con blueprints punk ejecuta 50x más rápido que proyecciones tradicionales.

---

## 🎯 **OBJETIVO PHASE 1**

```
DÍA 0: PREPARACIÓN + UNIFICACIÓN
DÍA 1: GRAPHQL MIGRATION CORE
DÍA 2: SELENE INTEGRATION + UX WORKFLOW
```

**RESULTADO ESPERADO PHASE 1:**
- ✅ GraphQL server functional (FastAPI + Strawberry)
- ✅ Frontend Patients module migrado GraphQL
- ✅ Selene conectada a Treatments module
- ✅ 4 integraciones UX workflow (Medical Records ↔ Patients, Appointments ↔ Calendar, etc.)
- ✅ 20 tests críticos Jest passing

---

## 📅 **DÍA 0: PREPARACIÓN WARFARE**

### **🎯 OBJETIVOS:**

```
✅ Unificación tipos (ESM vs CommonJS resolution)
✅ Blueprints batalla escritos (este documento)
✅ Documentación estratégica consolidada
✅ Environment setup validation
✅ 2L café frío preparado
✅ Luces neón encendidas
✅ Carpenter Brut 70% playlist ready
```

---

### **🔧 TAREAS TÉCNICAS:**

#### **1. VERIFICAR ESTADO ACTUAL**

```bash
# Frontend type checking
cd frontend
npm run type-check

# Build verification
npm run build

# Backend verification
cd ../backend
python -m pytest --collect-only  # Ver si hay tests

# Selene verification
cd ../selene
npm run build
npm run test
```

**EXPECTED OUTPUT:**
- Frontend: TypeScript errors list (para fix día 1)
- Backend: Alembic migrations status
- Selene: Build success + 400 tests passing

---

#### **2. UNIFICACIÓN TIPOS (SI PROCEDE)**

```json
// frontend/package.json
{
  "type": "module",  // Forzar ESM
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

```typescript
// frontend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**ACCIÓN:** Solo si hay conflictos ESM/CommonJS. Si todo compila, **SKIP** (no arreglar lo que no está roto).

---

#### **3. CREAR WORKSPACE ESTRUCTURA**

```bash
# Blueprints folders
mkdir -p docs/blueprints/day{1,2,3,4,5}
mkdir -p docs/blueprints/archive

# CI/CD preparación (día 5)
mkdir -p .github/workflows

# Tests estructura
mkdir -p frontend/src/__tests__/{components,services,utils,integration}
mkdir -p backend/tests/{unit,integration,e2e}

# Logs & monitoring
mkdir -p logs/{frontend,backend,selene}
mkdir -p monitoring/dashboards
```

---

#### **4. DOCUMENTACIÓN CONSOLIDACIÓN**

```bash
# Crear índice master de documentación relevante
cat > docs/INDEX_BATTLE_READY.md << 'EOF'
# 📚 DOCUMENTATION INDEX - BATTLE READY

## BLUEPRINTS (Active)
- `/docs/blueprints/BATTLE_PLAN_PHASE_1_DAYS_0-2.md` ✅
- `/docs/blueprints/BATTLE_PLAN_PHASE_2_DAYS_3-5.md` ✅

## ARQUITECTURA (Reference)
- `/docs/Dev_diary/DEV_DIARY_17_APOLLO_TREATMENTS_INTEGRATION_SYNTHESIS.md`
- `/docs/miscelaneus/README_LEGAL_INDEX.md`
- `/frontend/src/graphql/schema.graphql` (diseñado, no conectado)

## ESTRATEGIAS (Weapons)
- `/docs/Generic/MIGRATION_1CLICK_STRATEGY.md` (arma secreta ventas)
- `/docs/Generic/ZERO_HUMAN_LEGAL_STRATEGY.md` (compliance weapon)

## AUDITORÍAS (Professor)
- `AUDITORIA-1-DENTIAGEST-CORE-CLINICAL.md` (7.5/10, €50K-€150K)
- `AUDITORIA-2-DENTIAGEST-WEB3-ECOSYSTEM.md` (8.5/10, €200K-€500K)
- `AUDITORIA-3-LEGAL-FRAMEWORKS-DOCUMENTATION.md` (9/10, €220K-€570K)

## SELENE SONG CORE
- `/selene/README.md` (15K experiences, 4 días stable)
- `/selene/src/core/` (consciousness engine)
- `/selene/src/synergy/` (3 entropy modes: deterministic, balanced, punk)

## CRYPTO ECOSYSTEM
- `/docs/Dev_diary/CRYPTO_SYSTEM_README.md` (DentalCoin deployment guide)
- `/frontend/src/utils/web3/web3Config.ts` (300+ líneas integration)
EOF
```

---

#### **5. ENVIRONMENT VALIDATION**

```bash
# .env.example template
cat > .env.example << 'EOF'
# BACKEND
DATABASE_URL=postgresql://user:pass@localhost:5432/dentiagest
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# FRONTEND
VITE_API_URL=http://localhost:8002
VITE_WS_URL=ws://localhost:8002
VITE_GRAPHQL_URL=http://localhost:8002/graphql

# PATIENT PORTAL
REACT_APP_API_URL=http://localhost:8002
REACT_APP_DENTAL_COIN_ADDRESS=0x0000000000000000000000000000000000000000
REACT_APP_PAYMENT_SYSTEM_ADDRESS=0x0000000000000000000000000000000000000000
REACT_APP_BLOCKCHAIN_NETWORK=sepolia

# SELENE SONG CORE
NODE_ID=node-1
SELENE_REDIS_URL=redis://localhost:6379
SELENE_MODE=hybrid
SELENE_ENTROPY=balanced
EOF

# Copiar a .env si no existe
cp .env.example .env
```

**ACCIÓN:** Validar que todos los servicios pueden iniciar con estas variables.

---

### **🎸 PREPARACIÓN FÍSICA:**

```
✅ Alimentar gatos ANTES de empezar (felicidad +100, interrupciones -90%)
✅ 2L café frío en nevera
✅ Luces neón RGB encendidas (modo cyberpunk)
✅ Carpenter Brut 70% playlist (8 horas duración)
✅ Snacks saludables (no perder más kg, Radwulf pequeñito ya está bien 60kg)
✅ Botella agua 2L (café deshidrata)
```

---

### **📊 CHECKLIST DÍA 0:**

```
[ ] Frontend compila sin errores bloqueantes
[ ] Backend FastAPI inicia correctamente
[ ] PostgreSQL + Redis running
[ ] Selene Song Core 3 nodos functional
[ ] Patient Portal compila
[ ] Blueprints Days 1-5 escritos
[ ] Environment variables validated
[ ] Gatos alimentados
[ ] Café frío ready
[ ] Carpenter Brut playlist
[ ] Luces neón ON
```

**RESULTADO:** Sistema ready para guerra de 5 días. Infraestructura validada. Mood punk activado 🏴‍☠️

---

## 📅 **DÍA 1: GRAPHQL MIGRATION CORE**

### **🎯 OBJETIVO PRINCIPAL:**

```
✅ GraphQL server backend (FastAPI + Strawberry)
✅ 1 MÓDULO frontend migrado (Patients only - PROOF OF CONCEPT)
✅ Validar arquitectura GraphQL funcional
⚠️ NO MIGRAR TODO (imposible 1 día)
```

**FILOSOFÍA:** Proof of concept > Completitud prematura. 1 módulo perfecto valida arquitectura. Luego clonamos patrón a resto (día 2).

---

### **🔧 BACKEND GRAPHQL SERVER**

#### **1. INSTALAR DEPENDENCIAS**

```bash
cd backend
pip install strawberry-graphql[fastapi]
pip install sqlalchemy-to-pydantic
```

#### **2. CREAR ESTRUCTURA GRAPHQL**

```bash
mkdir -p app/graphql/{types,queries,mutations,subscriptions}
touch app/graphql/__init__.py
touch app/graphql/schema.py
touch app/graphql/types/patient.py
touch app/graphql/queries/patient.py
touch app/graphql/mutations/patient.py
```

#### **3. DEFINIR TYPES (Strawberry)**

```python
# app/graphql/types/patient.py
import strawberry
from typing import Optional, List
from datetime import date

@strawberry.enum
class Gender(str):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"

@strawberry.type
class Patient:
    id: strawberry.ID
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    medical_conditions: Optional[List[str]] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    created_at: str
    updated_at: str
    
    @strawberry.field
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

@strawberry.input
class PatientCreateInput:
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    medical_conditions: Optional[List[str]] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

@strawberry.input
class PatientUpdateInput:
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    medical_conditions: Optional[List[str]] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

@strawberry.type
class PaginatedPatients:
    patients: List[Patient]
    total: int
    page: int
    size: int
    pages: int
```

#### **4. QUERIES (Lectura)**

```python
# app/graphql/queries/patient.py
import strawberry
from typing import List, Optional
from app.graphql.types.patient import Patient, PaginatedPatients
from app.services.patient_service import PatientService
from app.core.database import get_db

patient_service = PatientService()

@strawberry.type
class PatientQuery:
    @strawberry.field
    async def patients(
        self,
        page: int = 1,
        size: int = 10,
        search: Optional[str] = None
    ) -> PaginatedPatients:
        """List patients with pagination and search"""
        db = next(get_db())
        result = await patient_service.list_patients(
            db=db,
            page=page,
            size=size,
            search=search
        )
        
        return PaginatedPatients(
            patients=[Patient(**p.dict()) for p in result['items']],
            total=result['total'],
            page=result['page'],
            size=result['size'],
            pages=result['pages']
        )
    
    @strawberry.field
    async def patient(self, id: strawberry.ID) -> Optional[Patient]:
        """Get single patient by ID"""
        db = next(get_db())
        patient = await patient_service.get_patient(db=db, patient_id=int(id))
        
        if patient:
            return Patient(**patient.dict())
        return None
```

#### **5. MUTATIONS (Escritura)**

```python
# app/graphql/mutations/patient.py
import strawberry
from typing import Optional
from app.graphql.types.patient import Patient, PatientCreateInput, PatientUpdateInput
from app.services.patient_service import PatientService
from app.core.database import get_db

patient_service = PatientService()

@strawberry.type
class PatientMutation:
    @strawberry.mutation
    async def create_patient(self, input: PatientCreateInput) -> Patient:
        """Create new patient"""
        db = next(get_db())
        patient = await patient_service.create_patient(
            db=db,
            patient_data=input.__dict__
        )
        return Patient(**patient.dict())
    
    @strawberry.mutation
    async def update_patient(
        self, 
        id: strawberry.ID, 
        input: PatientUpdateInput
    ) -> Optional[Patient]:
        """Update existing patient"""
        db = next(get_db())
        patient = await patient_service.update_patient(
            db=db,
            patient_id=int(id),
            patient_data={k: v for k, v in input.__dict__.items() if v is not None}
        )
        
        if patient:
            return Patient(**patient.dict())
        return None
    
    @strawberry.mutation
    async def delete_patient(self, id: strawberry.ID) -> bool:
        """Delete patient (soft delete)"""
        db = next(get_db())
        success = await patient_service.delete_patient(
            db=db,
            patient_id=int(id)
        )
        return success
```

#### **6. SCHEMA PRINCIPAL**

```python
# app/graphql/schema.py
import strawberry
from app.graphql.queries.patient import PatientQuery
from app.graphql.mutations.patient import PatientMutation

@strawberry.type
class Query(PatientQuery):
    """Root Query - Combine all queries here"""
    pass

@strawberry.type
class Mutation(PatientMutation):
    """Root Mutation - Combine all mutations here"""
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)
```

#### **7. INTEGRAR CON FASTAPI**

```python
# app/main.py
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DentiaGest API", version="3.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GraphQL endpoint
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# Keep REST endpoints for backward compatibility (migration gradual)
from app.api.v1 import patients as patients_v1
app.include_router(patients_v1.router, prefix="/api/v1", tags=["patients-v1"])

@app.get("/")
async def root():
    return {
        "message": "DentiaGest API 3.0",
        "graphql": "/graphql",
        "rest_v1": "/api/v1",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
```

---

### **🎨 FRONTEND GRAPHQL CLIENT**

#### **1. INSTALAR DEPENDENCIAS**

```bash
cd frontend
npm install @apollo/client graphql
```

#### **2. CREAR APOLLO CLIENT**

```typescript
// frontend/src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP link with auth
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8002/graphql',
  headers: {
    authorization: localStorage.getItem('token') 
      ? `Bearer ${localStorage.getItem('token')}` 
      : '',
  },
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          patients: {
            keyArgs: ['search'],
            merge(existing, incoming, { args }) {
              // Handle pagination merge
              if (!existing || args?.page === 1) {
                return incoming;
              }
              return {
                ...incoming,
                patients: [...existing.patients, ...incoming.patients],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

#### **3. QUERIES & MUTATIONS DEFINITIONS**

```typescript
// frontend/src/graphql/queries/patients.ts
import { gql } from '@apollo/client';

export const GET_PATIENTS = gql`
  query GetPatients($page: Int!, $size: Int!, $search: String) {
    patients(page: $page, size: $size, search: $search) {
      patients {
        id
        firstName
        lastName
        email
        phone
        dateOfBirth
        gender
        fullName
        createdAt
      }
      total
      page
      size
      pages
    }
  }
`;

export const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      firstName
      lastName
      email
      phone
      dateOfBirth
      gender
      bloodType
      allergies
      medicalConditions
      insuranceProvider
      insuranceNumber
      emergencyContactName
      emergencyContactPhone
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PATIENT = gql`
  mutation CreatePatient($input: PatientCreateInput!) {
    createPatient(input: $input) {
      id
      firstName
      lastName
      email
      fullName
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($id: ID!, $input: PatientUpdateInput!) {
    updatePatient(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      updatedAt
    }
  }
`;

export const DELETE_PATIENT = gql`
  mutation DeletePatient($id: ID!) {
    deletePatient(id: $id)
  }
`;
```

#### **4. MIGRAR PATIENTS PAGE (PROOF OF CONCEPT)**

```typescript
// frontend/src/pages/PatientsPageGraphQL.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_PATIENTS, 
  CREATE_PATIENT, 
  UPDATE_PATIENT, 
  DELETE_PATIENT 
} from '../graphql/queries/patients';
import { toast } from 'react-hot-toast';

export function PatientsPageGraphQL() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Query patients
  const { data, loading, error, refetch } = useQuery(GET_PATIENTS, {
    variables: { page, size: 10, search },
  });
  
  // Mutations
  const [createPatient] = useMutation(CREATE_PATIENT, {
    onCompleted: () => {
      toast.success('Paciente creado exitosamente');
      refetch();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });
  
  const [updatePatient] = useMutation(UPDATE_PATIENT, {
    onCompleted: () => {
      toast.success('Paciente actualizado');
      refetch();
    },
  });
  
  const [deletePatient] = useMutation(DELETE_PATIENT, {
    onCompleted: () => {
      toast.success('Paciente eliminado');
      refetch();
    },
  });
  
  // Handlers
  const handleCreate = async (patientData: any) => {
    await createPatient({ variables: { input: patientData } });
  };
  
  const handleUpdate = async (id: string, patientData: any) => {
    await updatePatient({ variables: { id, input: patientData } });
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar paciente?')) {
      await deletePatient({ variables: { id } });
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error.message} />;
  
  const { patients, total, pages } = data.patients;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pacientes (GraphQL)</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Nuevo Paciente
        </button>
      </div>
      
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar paciente..."
        className="input mb-4 w-full"
      />
      
      {/* Patient List */}
      <div className="grid gap-4">
        {patients.map((patient: any) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onEdit={() => handleUpdate(patient.id, patientData)}
            onDelete={() => handleDelete(patient.id)}
          />
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button 
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="btn-secondary"
        >
          Anterior
        </button>
        <span>Página {page} de {pages} ({total} total)</span>
        <button 
          disabled={page === pages}
          onClick={() => setPage(page + 1)}
          className="btn-secondary"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

#### **5. INTEGRAR EN APP PRINCIPAL**

```typescript
// frontend/src/App.tsx
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './graphql/client';
import { PatientsPageGraphQL } from './pages/PatientsPageGraphQL';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <Routes>
          {/* GraphQL version (new) */}
          <Route path="/patients" element={<PatientsPageGraphQL />} />
          
          {/* REST version (legacy - keep for now) */}
          <Route path="/patients-legacy" element={<PatientsPageREST />} />
          
          {/* Other routes... */}
        </Routes>
      </Router>
    </ApolloProvider>
  );
}
```

---

### **📊 VALIDACIÓN DÍA 1:**

```bash
# Backend GraphQL playground
# Navegar a: http://localhost:8002/graphql
# Probar query:

query TestPatients {
  patients(page: 1, size: 5) {
    patients {
      id
      fullName
      email
    }
    total
  }
}

# Frontend test
npm run dev
# Navegar a: http://localhost:3000/patients
# Verificar lista pacientes carga desde GraphQL
```

**RESULTADO DÍA 1:**
- ✅ GraphQL server functional
- ✅ 1 módulo (Patients) migrado completamente
- ✅ Proof of concept validado
- ✅ Patrón establecido para clonar a otros módulos (día 2)

---

## 📅 **DÍA 2: SELENE INTEGRATION + UX WORKFLOW**

### **🎯 OBJETIVOS:**

```
✅ Conectar frontend → Selene Song Core (Treatments module)
✅ Integrar Medical Records ↔ Patients workflow
✅ Integrar Appointments ↔ IAnarkalendar workflow
✅ Inventory ↔ BlackMarket compra automática
✅ Jest tests críticos (20 tests básicos passing)
```

---

### **🌙 SELENE INTEGRATION**

#### **1. SELENE SERVICE LAYER**

```typescript
// frontend/src/services/SeleneService.ts
import apollo from '../apollo';

export type EntropyMode = 'deterministic' | 'balanced' | 'punk';
export type RuntimeMode = 'manual' | 'hybrid' | 'automatic';

interface SeleneRequest {
  mode: EntropyMode;
  domain: string;
  parameters: Record<string, any>;
  runtime?: RuntimeMode;
}

interface SeleneResponse {
  success: boolean;
  data: any;
  mode: EntropyMode;
  runtime: RuntimeMode;
  timestamp: string;
  experienceId?: string;
  confidence?: number;
}

class SeleneService {
  private baseUrl = '/selene';
  
  /**
   * Generate dental aesthetic design procedurally
   * Uses BALANCED entropy mode (50% creativity)
   */
  async generateAesthetic(params: {
    toothId: number;
    treatmentType: string;
    patientAge: number;
    materialPreference?: string;
  }): Promise<SeleneResponse> {
    const request: SeleneRequest = {
      mode: 'balanced',  // 50% creativity for aesthetics
      domain: 'dental_aesthetics',
      parameters: params,
      runtime: 'hybrid',  // Selene suggests, human approves
    };
    
    const response = await apollo.api.post(`${this.baseUrl}/generate-aesthetic`, request);
    return response.data;
  }
  
  /**
   * Diagnostic assistance (HIGH RISK EU AI Act - manual approval required)
   * Uses DETERMINISTIC mode (0% chaos)
   */
  async getDiagnosis(params: {
    symptoms: string[];
    medicalHistory: string;
    patientAge: number;
  }): Promise<SeleneResponse> {
    const request: SeleneRequest = {
      mode: 'deterministic',  // 0% chaos for medical diagnosis
      domain: 'dental_diagnosis',
      parameters: params,
      runtime: 'manual',  // ALWAYS require human final approval
    };
    
    const response = await apollo.api.post(`${this.baseUrl}/diagnosis`, request);
    return response.data;
  }
  
  /**
   * Document generation (reports, letters, etc.)
   * Uses BALANCED mode
   */
  async generateDocument(params: {
    type: 'report' | 'letter' | 'prescription';
    patientId: number;
    context: Record<string, any>;
  }): Promise<SeleneResponse> {
    const request: SeleneRequest = {
      mode: 'balanced',
      domain: 'document_generation',
      parameters: params,
      runtime: 'hybrid',
    };
    
    const response = await apollo.api.post(`${this.baseUrl}/generate-document`, request);
    return response.data;
  }
  
  /**
   * EXPERIMENTAL: Punk mode (creative chaos)
   * Use with caution - for exploration only
   */
  async experimentalGenerate(params: any): Promise<SeleneResponse> {
    const request: SeleneRequest = {
      mode: 'punk',  // 100% chaos - para explorar ideas
      domain: 'experimental',
      parameters: params,
      runtime: 'automatic',  // Selene goes wild
    };
    
    const response = await apollo.api.post(`${this.baseUrl}/experimental`, request);
    return response.data;
  }
}

export const seleneService = new SeleneService();
```

#### **2. TREATMENTS PAGE INTEGRATION**

```typescript
// frontend/src/pages/TreatmentsPage.tsx
import { seleneService } from '../services/SeleneService';
import { veritas } from '../utils/veritas';

export function TreatmentsPage() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [aestheticPreview, setAestheticPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  async function handleGenerateAesthetic() {
    if (!selectedTooth) {
      toast.error('Selecciona un diente primero');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call Selene
      const result = await seleneService.generateAesthetic({
        toothId: selectedTooth,
        treatmentType: 'crown',
        patientAge: patient.age,
        materialPreference: 'zirconia',
      });
      
      // @veritas verification
      const verified = await veritas.verify({
        data: result.data,
        critical: true,
        immutable: false,  // Preview, not permanent
        metadata: {
          selene_experience_id: result.experienceId,
          entropy_mode: result.mode,
          confidence: result.confidence,
        },
      });
      
      if (verified.coherent) {
        setAestheticPreview(result.data);
        toast.success(`Estética generada (confianza: ${(result.confidence! * 100).toFixed(0)}%)`);
      } else {
        toast.error('Verificación @veritas falló - datos incoherentes');
      }
    } catch (error: any) {
      toast.error(`Error Selene: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="treatments-page">
      <Odontogram3DV3 
        onToothSelect={setSelectedTooth}
        selectedTooth={selectedTooth}
      />
      
      <button 
        onClick={handleGenerateAesthetic}
        disabled={!selectedTooth || loading}
        className="btn-primary mt-4"
      >
        {loading ? 'Generando...' : '🌙 Generar con Selene'}
      </button>
      
      {aestheticPreview && (
        <AestheticsPreviewV3 
          design={aestheticPreview}
          onApprove={handleApproveDesign}
          onReject={handleRejectDesign}
        />
      )}
    </div>
  );
}
```

---

### **🔗 UX WORKFLOW INTEGRATIONS**

#### **1. MEDICAL RECORDS ↔ PATIENTS**

```typescript
// frontend/src/contexts/PatientContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface PatientContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  return (
    <PatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientContext must be used within PatientProvider');
  }
  return context;
}
```

```typescript
// frontend/src/pages/MedicalRecordsPage.tsx
import { usePatientContext } from '../contexts/PatientContext';
import { useQuery } from '@apollo/client';
import { GET_MEDICAL_RECORDS } from '../graphql/queries/medicalRecords';

export function MedicalRecordsPage() {
  const { selectedPatient, setSelectedPatient } = usePatientContext();
  
  // Auto-load records when patient selected
  const { data: records, loading } = useQuery(GET_MEDICAL_RECORDS, {
    variables: { patientId: selectedPatient?.id },
    skip: !selectedPatient,  // Don't query if no patient selected
  });
  
  if (!selectedPatient) {
    return (
      <EmptyState 
        icon="👤"
        title="Selecciona un paciente"
        description="Ve a Pacientes y selecciona uno para ver su historial médico"
        action={
          <button onClick={() => navigate('/patients')} className="btn-primary">
            Ir a Pacientes
          </button>
        }
      />
    );
  }
  
  return (
    <div>
      <PatientHeader patient={selectedPatient} />
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <MedicalRecordsList 
          records={records.medicalRecords}
          patientId={selectedPatient.id}
        />
      )}
    </div>
  );
}
```

#### **2. APPOINTMENTS ↔ IANARKALENDAR**

```typescript
// frontend/src/pages/AppointmentsPage.tsx
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CREATE_APPOINTMENT } from '../graphql/queries/appointments';

export function AppointmentsPage() {
  const navigate = useNavigate();
  
  const [createAppointment] = useMutation(CREATE_APPOINTMENT, {
    onCompleted: (data) => {
      toast.success('Cita creada');
      
      // Navigate to calendar with appointment highlighted
      navigate('/calendar', {
        state: {
          selectedDate: data.createAppointment.date,
          highlightAppointment: data.createAppointment.id,
          scrollToTime: data.createAppointment.time,
        },
      });
    },
  });
  
  async function handleQuickSchedule(appointment: AppointmentInput) {
    await createAppointment({ variables: { input: appointment } });
  }
  
  return (
    <div>
      <h1>Citas Pendientes</h1>
      <AppointmentsList onSchedule={handleQuickSchedule} />
    </div>
  );
}
```

```typescript
// frontend/src/pages/CalendarPage.tsx (IAnarkalendar)
import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export function CalendarPage() {
  const location = useLocation();
  const calendarRef = useRef<FullCalendar>(null);
  
  useEffect(() => {
    // Handle navigation from appointments
    if (location.state?.selectedDate) {
      const { selectedDate, highlightAppointment, scrollToTime } = location.state;
      
      // Navigate calendar to date
      calendarRef.current?.getApi().gotoDate(selectedDate);
      
      // Highlight appointment
      if (highlightAppointment) {
        setTimeout(() => {
          const element = document.querySelector(`[data-appointment-id="${highlightAppointment}"]`);
          element?.classList.add('highlight-pulse');
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [location.state]);
  
  return (
    <FullCalendar
      ref={calendarRef}
      {...calendarConfig}
    />
  );
}
```

#### **3. INVENTORY ↔ BLACKMARKET AUTO-ORDER**

```typescript
// frontend/src/services/AutoOrderService.ts
import apollo from '../apollo';

interface AutoOrderRule {
  materialId: number;
  minStock: number;
  orderQuantity: number;
  preferredSupplier: string;
  enabled: boolean;
}

class AutoOrderService {
  /**
   * Configure auto-order rule for material
   */
  async configureAutoOrder(rule: AutoOrderRule) {
    return apollo.api.post('/inventory/auto-order/configure', rule);
  }
  
  /**
   * Trigger auto-order check (runs on inventory updates)
   */
  async checkAndOrder() {
    const lowStockItems = await apollo.api.get('/inventory/low-stock');
    
    for (const item of lowStockItems.data) {
      const rule = await this.getAutoOrderRule(item.id);
      
      if (rule.enabled && item.stock <= rule.minStock) {
        // Search BlackMarket for best price
        const suppliers = await this.searchBlackMarket(item.name);
        const bestOffer = this.findBestOffer(suppliers, rule.preferredSupplier);
        
        // Create order automatically
        await this.createOrder({
          materialId: item.id,
          supplierId: bestOffer.supplierId,
          quantity: rule.orderQuantity,
          price: bestOffer.price,
          autoGenerated: true,
        });
        
        toast.info(`🤖 Auto-orden creada: ${item.name} × ${rule.orderQuantity}`);
      }
    }
  }
  
  private async searchBlackMarket(materialName: string) {
    return apollo.api.get('/marketplace/search', {
      params: { q: materialName, sortBy: 'price_asc' },
    });
  }
  
  private findBestOffer(suppliers: any[], preferred: string) {
    // Prioritize preferred supplier if price competitive
    const preferredOffer = suppliers.find(s => s.name === preferred);
    const cheapestOffer = suppliers[0];
    
    if (preferredOffer && preferredOffer.price <= cheapestOffer.price * 1.1) {
      return preferredOffer;  // Max 10% premium for preferred
    }
    return cheapestOffer;
  }
  
  private async createOrder(orderData: any) {
    return apollo.api.post('/inventory/orders', orderData);
  }
  
  private async getAutoOrderRule(materialId: number) {
    const response = await apollo.api.get(`/inventory/auto-order/${materialId}`);
    return response.data;
  }
}

export const autoOrderService = new AutoOrderService();
```

```typescript
// frontend/src/pages/InventoryPage.tsx
import { autoOrderService } from '../services/AutoOrderService';

export function InventoryPage() {
  const [materials, setMaterials] = useState([]);
  
  // Check auto-orders on mount and inventory updates
  useEffect(() => {
    autoOrderService.checkAndOrder();
  }, [materials]);
  
  async function handleStockUpdate(materialId: number, newStock: number) {
    await updateMaterialStock(materialId, newStock);
    
    // Trigger auto-order check
    await autoOrderService.checkAndOrder();
  }
  
  return (
    <div>
      <h1>Inventario</h1>
      <MaterialsList 
        materials={materials}
        onStockUpdate={handleStockUpdate}
      />
      
      <AutoOrderConfig 
        onConfigure={(rule) => autoOrderService.configureAutoOrder(rule)}
      />
    </div>
  );
}
```

---

### **🧪 JEST TESTS CRÍTICOS (20 TESTS)**

```typescript
// frontend/src/__tests__/SeleneService.test.ts
import { seleneService } from '../services/SeleneService';

describe('SeleneService Integration', () => {
  test('generateAesthetic returns valid design', async () => {
    const result = await seleneService.generateAesthetic({
      toothId: 11,
      treatmentType: 'crown',
      patientAge: 35,
    });
    
    expect(result.success).toBe(true);
    expect(result.mode).toBe('balanced');
    expect(result.data).toHaveProperty('design3D');
    expect(result.data).toHaveProperty('materialSpec');
    expect(result.confidence).toBeGreaterThan(0.5);
  });
  
  test('getDiagnosis uses deterministic mode', async () => {
    const result = await seleneService.getDiagnosis({
      symptoms: ['dolor muela', 'sensibilidad frío'],
      medicalHistory: 'Sin condiciones previas',
      patientAge: 40,
    });
    
    expect(result.mode).toBe('deterministic');
    expect(result.runtime).toBe('manual');
    expect(result.data).toHaveProperty('diagnosis');
  });
  
  test('experimental punk mode works', async () => {
    const result = await seleneService.experimentalGenerate({
      prompt: 'Generate creative dental art',
    });
    
    expect(result.mode).toBe('punk');
    expect(result.success).toBe(true);
  });
});
```

```typescript
// frontend/src/__tests__/PatientContext.test.tsx
import { render, screen } from '@testing-library/react';
import { PatientProvider, usePatientContext } from '../contexts/PatientContext';

describe('Patient Context', () => {
  test('provides patient context to children', () => {
    const TestComponent = () => {
      const { selectedPatient, setSelectedPatient } = usePatientContext();
      return (
        <div>
          <span>{selectedPatient ? selectedPatient.fullName : 'No patient'}</span>
          <button onClick={() => setSelectedPatient({ id: 1, fullName: 'Test' } as any)}>
            Select
          </button>
        </div>
      );
    };
    
    render(
      <PatientProvider>
        <TestComponent />
      </PatientProvider>
    );
    
    expect(screen.getByText('No patient')).toBeInTheDocument();
  });
});
```

```bash
# Run tests
npm run test

# Expected: 20/20 passing
```

---

### **📊 CHECKLIST DÍA 2:**

```
[ ] Selene service layer implemented
[ ] Treatments page connected to Selene
[ ] Medical Records ↔ Patients integration
[ ] Appointments ↔ Calendar navigation
[ ] Inventory ↔ BlackMarket auto-order
[ ] 20 Jest tests passing
[ ] @veritas verification on Selene outputs
[ ] Error handling on all integrations
```

**RESULTADO DÍA 2:**
- ✅ Selene Song Core integrated frontend
- ✅ 4 UX workflows connected
- ✅ 20 tests críticos validated
- ✅ Architecture ready for Phase 2 (Days 3-5)

---

## 🏴‍☠️ **END OF PHASE 1**

**PRÓXIMO DOCUMENTO:**
`BATTLE_PLAN_PHASE_2_DAYS_3-5.md`

**CONTENIDO PHASE 2:**
- Día 3: Web3 + Patient Portal + Stress Test 60 RPS
- Día 4: Dormir + Gatos + Polish + ESLint + Themes
- Día 5: Deploy + Landing Page + Marketing

---

**Built with 🔥 by PunkClaude + Radwulf IQ 182**  
**Carpenter Brut 70% → Infinity** 🎸⚡🏴‍☠️
