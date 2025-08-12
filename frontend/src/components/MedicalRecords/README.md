# Módulo de Historiales Médicos - Frontend

## 📋 Descripción

Este módulo proporciona una interfaz completa para la gestión de historiales médicos en DentiaGest. Incluye funcionalidades para visualizar, crear, editar y gestionar historiales médicos de pacientes.

## 🏗️ Arquitectura de Componentes

### Componentes Principales

#### 1. **MedicalRecordsContainer** (Contenedor Principal)
- **Ubicación**: `src/components/MedicalRecords/MedicalRecordsContainer.tsx`
- **Propósito**: Orquesta toda la funcionalidad del módulo
- **Responsabilidades**:
  - Gestión del estado global del módulo
  - Coordinación entre componentes
  - Manejo de modales y transiciones

#### 2. **MedicalRecordsList** (Lista de Historiales)
- **Ubicación**: `src/components/MedicalRecords/MedicalRecordsList.tsx`
- **Propósito**: Visualización y filtrado de historiales médicos
- **Características**:
  - ✅ Búsqueda y filtros avanzados
  - ✅ Paginación
  - ✅ Ordenamiento
  - ✅ Estadísticas rápidas
  - ✅ Vista de tarjetas responsiva

#### 3. **MedicalRecordForm** (Formulario de Creación/Edición)
- **Ubicación**: `src/components/MedicalRecords/MedicalRecordForm.tsx`
- **Propósito**: Creación y edición de historiales médicos
- **Características**:
  - ✅ Validación completa
  - ✅ Carga de pacientes
  - ✅ Gestión de estados de tratamiento
  - ✅ Información financiera
  - ✅ Configuración de seguimiento

#### 4. **MedicalRecordDetail** (Vista Detallada)
- **Ubicación**: `src/components/MedicalRecords/MedicalRecordDetail.tsx`
- **Propósito**: Visualización completa de un historial médico
- **Características**:
  - ✅ Vista completa de información
  - ✅ Información del paciente
  - ✅ Estados y prioridades
  - ✅ Información financiera
  - ✅ Acciones (imprimir, editar)

## 🚀 Uso e Integración

### 1. Integración Básica

```tsx
import { MedicalRecordsContainer } from '../components/MedicalRecords';

const MyApp = () => {
  return <MedicalRecordsContainer />;
};
```

### 2. Uso de Componentes Individuales

```tsx
import { 
  MedicalRecordsList, 
  MedicalRecordForm, 
  MedicalRecordDetail 
} from '../components/MedicalRecords';

const CustomMedicalRecords = () => {
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div>
      <MedicalRecordsList 
        onCreateNew={() => setShowForm(true)}
        onViewDetail={(id) => console.log('View:', id)}
        onEdit={(id) => console.log('Edit:', id)}
      />
      
      {showForm && (
        <MedicalRecordForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
```

### 3. Integración con Sistema de Rutas

```tsx
// En tu archivo de rutas (App.tsx o similar)
import MedicalRecordsPage from './pages/MedicalRecordsPage';

const routes = [
  {
    path: '/medical-records',
    component: MedicalRecordsPage
  }
];
```

## 📡 API Integration

### Endpoints Utilizados

- **GET** `/api/v1/medical-records/` - Lista paginada con filtros
- **GET** `/api/v1/medical-records/{id}` - Detalle de historial específico
- **POST** `/api/v1/medical-records/` - Crear nuevo historial
- **PUT** `/api/v1/medical-records/{id}` - Actualizar historial existente
- **DELETE** `/api/v1/medical-records/{id}` - Eliminar historial
- **GET** `/api/v1/patients/` - Lista de pacientes para selección

### Autenticación

Todos los componentes esperan un token JWT en `localStorage`:

```javascript
localStorage.getItem('token')
```

## 🎨 Estilos y Diseño

### Framework CSS
- **Tailwind CSS** para todos los estilos
- **Heroicons** para iconografía
- Diseño completamente responsivo

### Paleta de Colores
- **Primario**: Blue-600 (`#2563eb`)
- **Secundario**: Gray-500 (`#6b7280`)
- **Éxito**: Green-600 (`#059669`)
- **Advertencia**: Yellow-500 (`#eab308`)
- **Error**: Red-600 (`#dc2626`)

### Estados de Tratamiento
- **Planificado**: Azul (`bg-blue-100 text-blue-800`)
- **En Progreso**: Amarillo (`bg-yellow-100 text-yellow-800`)
- **Completado**: Verde (`bg-green-100 text-green-800`)
- **Cancelado**: Rojo (`bg-red-100 text-red-800`)
- **Pospuesto**: Gris (`bg-gray-100 text-gray-800`)
- **Requiere Seguimiento**: Naranja (`bg-orange-100 text-orange-800`)

## 🔧 Funcionalidades Implementadas

### ✅ Completadas
- [x] Lista de historiales con paginación
- [x] Búsqueda y filtros avanzados
- [x] Formulario de creación/edición
- [x] Vista detallada completa
- [x] Integración con API backend
- [x] Validación de formularios
- [x] Estados y prioridades
- [x] Información financiera
- [x] Seguimiento de citas
- [x] Responsive design
- [x] Gestión de errores

### 🚧 Por Implementar
- [ ] Carga de documentos adjuntos
- [ ] Firma digital
- [ ] Plantillas de historiales
- [ ] Exportación a PDF
- [ ] Historial de cambios
- [ ] Notificaciones automáticas
- [ ] Integración con calendario
- [ ] Estadísticas avanzadas

## 🔒 Seguridad y Permisos

### Niveles de Acceso
- **Confidencial**: Historiales marcados como confidenciales tienen indicador visual
- **Autenticación**: Todos los endpoints requieren token JWT válido
- **Validación**: Validación tanto en cliente como servidor

### Buenas Prácticas
- Datos sensibles no se almacenan en localStorage
- Tokens se envían siempre en headers Authorization
- Errores se manejan sin exponer información sensible

## 🧪 Testing y Calidad

### Estructura para Testing
```
tests/
├── components/
│   ├── MedicalRecordsList.test.tsx
│   ├── MedicalRecordForm.test.tsx
│   ├── MedicalRecordDetail.test.tsx
│   └── MedicalRecordsContainer.test.tsx
├── pages/
│   └── MedicalRecordsPage.test.tsx
└── utils/
    └── medicalRecords.test.ts
```

### Test Cases Recomendados
- Renderizado de componentes
- Formulario de validación
- Integración con API
- Estados de carga y error
- Filtros y búsqueda
- Paginación

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Adaptaciones por Dispositivo
- **Mobile**: Lista vertical, formularios apilados
- **Tablet**: Grid 2 columnas, modales centrados
- **Desktop**: Grid 3-4 columnas, sidebars

## 🔄 Patrón Reutilizable (PlatformGest)

Este módulo está diseñado para ser **fácilmente adaptable** a otros verticales:

### VetGest (Veterinaria)
```tsx
// Cambios principales:
- "Historial Médico" → "Historial Veterinario"
- "Paciente" → "Mascota"
- Campos específicos: raza, especie, peso, vacunas
```

### MechaGest (Taller Mecánico)
```tsx
// Cambios principales:
- "Historial Médico" → "Orden de Servicio"
- "Paciente" → "Vehículo"
- Campos específicos: marca, modelo, kilometraje, servicios
```

### RestaurantGest (Restaurante)
```tsx
// Cambios principales:
- "Historial Médico" → "Historial de Pedidos"
- "Paciente" → "Cliente"
- Campos específicos: mesa, pedidos, alergias, preferencias
```

## 📞 Soporte y Documentación

### Contacto de Desarrollo
- **Arquitecto**: GitHub Copilot
- **Documentación**: Este README
- **Issues**: Utilizar sistema de tickets del proyecto

### Recursos Adicionales
- [Documentación API Backend](../../backend/docs/)
- [Guía de Estilos Tailwind](https://tailwindcss.com/docs)
- [Iconografía Heroicons](https://heroicons.com/)

---

**🏥 DentiaGest Medical Records Module v1.0**  
*Desarrollado con React + TypeScript + Tailwind CSS*
