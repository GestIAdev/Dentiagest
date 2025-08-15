# 🌍 TIMEZONE FIX SUMMARY - August 9, 2025

## 🚨 PROBLEMA INICIAL:
- **Drag&drop**: 409 conflicts por timezone confusion
- **Edit modal**: -3 horas offset (enviaba local como UTC)
- **Create modal**: appointment_type 'others' no existía en backend
- **Duration**: Forzaba 30min mínimo (queremos 15min)

## ✅ SOLUCIONES IMPLEMENTADAS:

### 1. **Timezone Architecture**
```typescript
// utils/timezone.ts - Centralized timezone handling
CLINIC_TIMEZONE = 'America/Argentina/Buenos_Aires'
parseClinicDateTime() // Backend UTC → Local display
formatLocalDateTime() // Display → Backend format
```

### 2. **Drag&Drop Fix**
```typescript
// CalendarPage.tsx - Line ~205
const utcDateTime = eventStart.toISOString().slice(0, -5) + 'Z';
// Converts: Local 10:00 AM → UTC 13:00 → Backend stores correctly
```

### 3. **Edit Modal Fix**
```typescript
// EditAppointmentModal.tsx - Line ~143
const localDateTime = new Date(`${formData.date}T${formData.time}:00`);
const utcDateTime = localDateTime.toISOString().slice(0, -5) + 'Z';
// Same logic as drag&drop for consistency
```

### 4. **Appointment Types Fix**
```typescript
// Both modals now use valid backend values:
'consultation', 'cleaning', 'filling', 'extraction', 
'orthodontics', 'emergency', 'follow_up', 'checkup'
// Removed: 'others', 'followup' (wrong format)
```

### 5. **15min Duration Support**
```typescript
// useAppointments.ts - Line 68
if (duration < 15) duration = 15; // Was: < 30
// CalendarPage.tsx - 15min grid slots
slotDuration="00:15:00", snapDuration="00:15:00"
```

## 🎯 RESULTADO:
- ✅ **Timezone consistent**: Argentina GMT-3 handled correctly
- ✅ **No more 409 conflicts**: UTC conversion works
- ✅ **Edit works**: Time displays and saves correctly  
- ✅ **15min appointments**: Supported and visible
- ✅ **All appointment types**: Valid backend values

## 🚀 NEXT: FullCalendar Grid 2x2 Hack
Ready to attempt CSS Grid hack for better visual layout.
All current functionality preserved as fallback.
