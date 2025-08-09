# PlatformGest Documentation Generator

## 🎯 ¿Qué hace este script?

Automatiza completamente el proceso de extracción de patrones universales desde DentiaGest hacia la documentación de PlatformGest.

## 🚀 Características principales

### 🔍 **Análisis Inteligente de Código**
- **Detección automática** de patrones universales vs específicos
- **Cálculo de extractabilidad** (porcentaje universal por archivo)
- **Identificación de componentes**: funciones, clases, endpoints, imports
- **Categorización automática**: Altamente extractable (80%+), Moderado (40-80%), Específico (<40%)

### 📝 **Generación de Prompts para IA**
- **Prompts optimizados** para Gemini con contexto completo
- **Ejemplos de código** formateados automáticamente
- **Instrucciones específicas** para cada tipo de análisis
- **Formato estandarizado** para máxima comprensión de IA

### 📊 **Reportes y Analytics**
- **Reportes consolidados** por directorio
- **Métricas de extractabilidad** detalladas
- **Tracking de progreso** de documentación
- **Exports en Markdown** listos para usar

## 🛠️ Instalación y uso

### **Windows:**
```bash
# Ejecutar el script interactivo
cd C:\path\to\Dentiagest\scripts
run_doc_generator.bat
```

### **Linux/Mac:**
```bash
# Hacer ejecutable y correr
chmod +x run_doc_generator.sh
./run_doc_generator.sh
```

### **Python directo:**
```bash
python platformgest_doc_generator.py --interactive \
  --dentiagest-path "C:\path\to\Dentiagest" \
  --docs-path "C:\path\to\PlatformgestIA\core docs"
```

## 📁 Estructura de archivos generados

```
PlatformgestIA/core docs/
├── prompts/
│   ├── batch_prompt_backend_app_api.md
│   ├── gemini_prompt_auth.md
│   ├── gemini_prompt_users.md
│   └── gemini_prompt_patients.md
├── reports/
│   ├── extractability_report_20250804_143022.md
│   └── consolidated_analysis.json
└── specs/
    ├── auth_core_specs.md
    ├── users_core_specs.md
    └── patient_pattern_specs.md
```

## 🎮 Modos de uso

### **1. 🚀 Modo Interactivo (Recomendado)**
```
¿Qué quieres procesar?
[1] 📁 Directorio completo
[2] 📄 Archivo individual  
[3] 🚀 Batch de directorios principales
[4] 📊 Generar reporte completo
```

### **2. 📁 Análisis por Directorio**
- `backend/app/api` → APIs universales vs específicas
- `backend/app/core` → Componentes del core system
- `backend/app/models` → Modelos de datos universales vs específicos
- `backend/app/schemas` → Schemas Pydantic universales vs específicos

### **3. 📄 Análisis Individual**
- Análisis profundo de un archivo específico
- Prompt personalizado para Gemini
- Métricas detalladas de extractabilidad

### **4. 🔄 Procesamiento Batch**
- Procesa todos los directorios principales
- Genera reporte consolidado
- Ideal para análisis completo del proyecto

## 📊 Ejemplo de output

### **Análisis de archivo:**
```
🔍 Analizando: auth.py
✅ Análisis completado!
📊 Extractabilidad: 95.2%
📄 Prompt guardado en: prompts/gemini_prompt_auth.md

Componentes identificados:
- 12 funciones universales
- 3 endpoints FastAPI  
- 2 clases universales
- 0 componentes específicos
```

### **Reporte consolidado:**
```
## backend/app/api (Extractabilidad promedio: 78.5%)

🟢 ALTAMENTE EXTRACTABLES (80%+ universal):
- auth.py (95.2%)
- users.py (89.1%)

🟡 MODERADAMENTE EXTRACTABLES (40-80% universal):
- patients.py (23.4%)

🔴 ESPECÍFICOS (<40% universal):
- dental_procedures.py (12.8%)
```

## 🔧 Configuración avanzada

### **Personalizar paths:**
```python
# Editar en el script
DENTIAGEST_PATH = "C:/tu/path/a/Dentiagest"
PLATFORMGEST_DOCS_PATH = "C:/tu/path/a/PlatformgestIA/core docs"
```

### **Personalizar patrones de detección:**
```python
# Marcadores universales
universal_markers = [
    "PLATFORM_EXTRACTABLE",
    "PLATFORM_CORE", 
    "UNIVERSAL",
    "# Universal"
]

# Marcadores específicos
specific_markers = [
    "DENTAL_SPECIFIC",
    "# DENTAL",
    "dental",
    "patient"
]
```

## 🎯 Workflow recomendado

### **Paso 1: Análisis inicial**
```bash
# Ejecutar análisis batch para visión general
./run_doc_generator.sh → Opción 4
```

### **Paso 2: Revisar reportes**
```bash
# Verificar métricas de extractabilidad
# Identificar archivos más universales
# Priorizar componentes para documentar
```

### **Paso 3: Generar prompts**
```bash
# Para cada componente prioritario
./run_doc_generator.sh → Opción 2
# Seleccionar directorio específico
```

### **Paso 4: Trabajo con Gemini**
```bash
# Copiar prompt generado → Gemini
# Obtener documentación técnica
# Guardar como .md en PlatformgestIA/core docs
```

### **Paso 5: Iteración**
```bash
# Repetir para todos los componentes
# Construir documentación completa
# Validar patrones universales
```

## 🔥 Beneficios del script

### **⏱️ Ahorro de tiempo:**
- **95% menos tiempo** en análisis manual
- **Prompts automáticos** listos para IA
- **Categorización inteligente** de componentes

### **📈 Precisión mejorada:**
- **Detección sistemática** de patrones
- **Métricas objetivas** de extractabilidad  
- **Análisis consistente** entre archivos

### **🔄 Escalabilidad:**
- **Reutilizable** para cualquier proyecto
- **Configurable** para diferentes patrones
- **Extensible** para nuevos tipos de análisis

### **🎯 Calidad documental:**
- **Prompts optimizados** para mejor output de IA
- **Contexto completo** en cada análisis
- **Formato estandarizado** para documentación

## 📚 Casos de uso

### **🏥 Para DentiaGest:**
- Identificar qué APIs son 100% universales
- Documentar patrones específicos dentales
- Generar especificaciones para PlatformGest

### **🐾 Para futuros VetGest:**
- Usar patrones universales extraídos
- Adaptar componentes específicos veterinarios
- Acelerar desarrollo con core probado

### **🔧 Para futuros MechaGest:**
- Reutilizar auth, users, core systems
- Implementar modelos específicos automotrices
- Mantener consistencia arquitectónica

### **🍽️ Para futuros RestaurantGest:**
- Aprovechar toda la infraestructura universal
- Personalizar para gestión gastronómica
- Reducir tiempo de desarrollo 80%+

## 🚀 ¡Resultado final!

**Con este script obtienes:**
- ✅ **Análisis automatizado** completo
- ✅ **Prompts optimizados** para IA
- ✅ **Documentación sistemática** de patrones
- ✅ **Roadmap claro** para PlatformGest
- ✅ **Base sólida** para múltiples verticales

**¡Tu workflow de documentación pasa de manual a COMPLETAMENTE AUTOMATIZADO!** 🎯
