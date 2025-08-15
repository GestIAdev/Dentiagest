# 🗂️ WEEKLY VIEW STACKING ISSUE - DentiaGest Day 5

**Fecha**: 10 Agosto 2025  
**Estado**: DEBUGGING PENDIENTE  
**Contexto**: FullCalendar Extermination - AInarkalendar Reborn Phase  

## 🎯 Situación Actual

### ✅ Lo que FUNCIONA:
- ✅ **FullCalendar eliminado** ($1000+ anuales ahorrados)
- ✅ **AInarkalendar core implementado** 
- ✅ **Vista mensual funcionando perfectamente**
- ✅ **Vista semanal con arquitectura "Hora Colapsada Inteligente"**
- ✅ **Filtrado de datos por día/hora PERFECTO**
- ✅ **Detección de múltiples citas en misma hora**
- ✅ **Container positioning system trabajando**
- ✅ **Z-index management correcto**

### 🚨 PROBLEMA ACTUAL:

**Síntoma**: En la hora 9:00 del lunes se detectan 3 citas (María García, Raul Devea, Carlos López) en los logs de consola, pero **visualmente solo aparece 1 tarjeta**.

**Evidencia técnica**:
```
Hour 9:00 - Found 3 appointments: (3) ['María García (2025-08-11T09:30:00Z)', 'Raul Devea (2025-08-11T09:00:00Z)', 'Carlos López (2025-08-11T09:45:00Z)']
Appointment María García - Index: 0, Z-Index: 100
Appointment Raul Devea - Index: 1, Z-Index: 99  
Appointment Carlos López - Index: 2, Z-Index: 98
```

**Lo que debería verse**: 3 tarjetas apiladas estilo "fichero/armario" con pestañas sobresaliendo
**Lo que se ve**: Solo 1 tarjeta (María García)

## 🔍 Diagnóstico Técnico

### Arquitectura "Hora Colapsada Inteligente":
- **Container único** por hora con altura fija calculada
- **Cards apiladas** desde bottom hacia arriba usando `bottom: ${bottomOffset}px`
- **Primera card** (index 0): Altura completa (`height: 'auto'`)
- **Cards superiores** (index > 0): Altura reducida (`height: '24px'`) para mostrar solo "pestaña"
- **Z-index descendente**: 100, 99, 98... para layering correcto

### Lo que SABEMOS que funciona:
1. **Datos llegan correctamente** ✅
2. **Filtering by hour funciona** ✅  
3. **Container positioning funciona** ✅
4. **Z-index calculation funciona** ✅
5. **Logs muestran 3 renders** ✅

### Lo que NO funciona:
1. **Visual rendering de cards 2 y 3** ❌
2. **Pestañas superiores no aparecen** ❌

## 🎯 Hipótesis del Problema

### Hipótesis Principal:
Las cards **se están renderizando** (por eso aparecen en logs) pero hay un problema de **CSS/positioning** que las hace invisibles o posicionadas fuera del viewport.

### Posibles causas:
1. **Overflow hidden** en algún container padre
2. **Height calculation** incorrecta para cards superiores
3. **Positioning conflict** entre `position: absolute` y container boundaries
4. **CSS specificity** issue con los estilos aplicados

## 🔧 Estado del Código

**Archivo principal**: `frontend/src/components/CustomCalendar/WeekViewSimple.tsx`

**Arquitectura actual**:
```tsx
// Container único por hora
<div className="relative" style={{ height: maxHeight }}>
  {hourlyAppointments.map((apt, index) => (
    <div 
      style={{ 
        bottom: `${bottomOffset}px`,
        zIndex: baseZIndex - index,
        height: isFirst ? 'auto' : '24px'
      }}
    >
      {/* Contenido de la card */}
    </div>
  ))}
</div>
```

**Último cambio**: Implementación de pestañas diferenciadas para cards apiladas vs card principal.

## 🚀 Próximos Pasos

### Debug Strategy:
1. **Visual debugging extremo**: Backgrounds de colores diferentes para cada card
2. **Console logging extendido**: Position values, heights, overflow status
3. **CSS inspection**: Verificar computed styles en DevTools
4. **Step-by-step positioning**: Verificar cada card individualmente

### Objetivo Final:
Lograr el efecto "fichero/armario" donde múltiples citas en la misma hora se muestren como:
- **Card principal** (abajo): Contenido completo visible
- **Cards apiladas** (arriba): Pestañas sobresaliendo con nombre + hora

## 📋 Context para Next Session

- **File to open**: `WeekViewSimple.tsx`
- **Focus area**: Lines 180-230 (card rendering loop)
- **Test data**: Lunes 9:00 AM con 3 citas
- **Expected behavior**: 3 visual cards stacked like file tabs

---
**Status**: PAUSED FOR FRESH PERSPECTIVE 🔄  
**Next Developer**: Take it away! 🚀
