# 📁 Paciente Virtual "Documentos Clínica"

## 🎯 **Concepto**
El paciente virtual "Documentos Clínica" es una entidad especial en el sistema DentiaGest que actúa como un **cajón desastre digital** para almacenar documentos administrativos y corporativos que no pertenecen a pacientes específicos.

## 🔧 **Implementación Técnica**

### **Base de Datos**
- **Tabla:** `patients` (misma tabla que pacientes reales)
- **ID:** `d76a8a03-1411-4143-85ba-6f064c7b564b`
- **Nombre:** "Documentos" 
- **Apellido:** "Clínica"
- **Campos opcionales:** Todos los demás campos están vacíos o con valores por defecto

### **Comportamiento en el Sistema**
```typescript
// ✅ VISIBLE en selector de pacientes para uploads
// ❌ INVISIBLE en listas normales de pacientes
// ✅ SELECCIONABLE para subir documentos administrativos
```

## 📋 **Tipos de Documentos que se Almacenan**

### **Documentos Administrativos**
- 🏢 Pólizas de seguro de la clínica
- 📄 Certificados y licencias
- 💰 Documentos financieros corporativos
- 📋 Contratos con proveedores
- 🔧 Manuales de equipamiento
- 📊 Reportes administrativos

### **Documentos Legales**
- ⚖️ Documentos normativos
- 📜 Contratos laborales de plantilla
- 🏛️ Documentos gubernamentales
- 🔒 Políticas de privacidad y RGPD

## 🎮 **Flujo de Usuario**

1. **Subir Documento Administrativo:**
   ```
   Usuario → Subir Documento → Seleccionar "Documentos Clínica" → Upload
   ```

2. **Categorización Automática:**
   - Sistema detecta que es documento administrativo
   - Asigna automáticamente `access_level: 'administrative'`
   - Permite acceso a recepcionistas y administradores

3. **Visualización:**
   - Los documentos aparecen solo cuando se selecciona "Documentos Clínica"
   - No contaminan las vistas de pacientes reales

## 🔒 **Seguridad y Acceso**

### **Niveles de Acceso**
- **Médico:** Solo si el documento es de naturaleza médica
- **Administrativo:** Para la mayoría de documentos corporativos

### **Permisos por Rol**
- **Admin:** Acceso total
- **Professional:** Acceso según nivel del documento  
- **Receptionist:** Solo documentos administrativos

## 💡 **Filosofía de Diseño**

### **¿Por qué usar un Paciente Virtual?**
1. **Simplicidad:** Reutiliza la infraestructura existente
2. **Consistencia:** Mantiene el patrón "documento → paciente"
3. **Escalabilidad:** Fácil de extender a otros tipos de entidades virtuales
4. **Compatibilidad:** No requiere cambios en la estructura de base de datos

### **¿Por qué no una tabla separada?**
- **Complejidad innecesaria:** Requeriría duplicar lógica de documentos
- **Inconsistencia:** Diferentes flujos para documentos médicos vs. administrativos
- **Mantenimiento:** Más código que mantener y testear

## 🚀 **Integración con Módulo de Billing**

### **Futuro: Gestión Financiera**
El paciente virtual puede integrarse con el módulo de billing para:

- **Facturas corporativas:** Gastos de la clínica
- **Presupuestos:** Inversiones en equipamiento
- **Reportes fiscales:** Documentación contable
- **Análisis financiero:** Dashboards de gastos

### **Implementación Futura**
```typescript
// Extensión para billing
interface CorporateDocument extends MedicalDocument {
  billing_category?: 'expense' | 'investment' | 'income' | 'tax';
  amount?: number;
  currency?: string;
  fiscal_year?: number;
}
```

## 🔍 **Identificación Técnica**

### **Para Desarrolladores**
```sql
-- Encontrar el paciente virtual
SELECT * FROM patients 
WHERE first_name = 'Documentos' AND last_name = 'Clínica';

-- Documentos del paciente virtual
SELECT * FROM medical_documents 
WHERE patient_id = 'd76a8a03-1411-4143-85ba-6f064c7b564b';
```

### **Para Scripts y Migraciones**
```python
# Identificador único del paciente virtual
VIRTUAL_PATIENT_ID = "d76a8a03-1411-4143-85ba-6f064c7b564b"
VIRTUAL_PATIENT_NAME = ("Documentos", "Clínica")
```

## 📈 **Métricas y Monitoreo**

### **KPIs Recomendados**
- Número de documentos administrativos subidos
- Tipos de documentos más frecuentes
- Usuarios que más utilizan el sistema
- Tamaño total de almacenamiento corporativo

### **Alertas Sugeridas**
- Documentos sin categorizar en paciente virtual
- Documentos médicos mal clasificados como administrativos
- Capacidad de almacenamiento del paciente virtual

## 🛠️ **Mantenimiento**

### **Limpieza Periódica**
- Revisar documentos duplicados
- Archivar documentos obsoletos
- Actualizar categorizaciones

### **Respaldos**
- Los documentos del paciente virtual deben incluirse en respaldos regulares
- Considerar respaldo separado para documentos críticos corporativos

---

**Creado:** 14 de Agosto, 2025  
**Versión:** 1.0  
**Autor:** Desarrollo DentiaGest  
**Estado:** Implementado y Activo
