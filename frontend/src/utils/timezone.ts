// 🌍 TIMEZONE UTILS PARA DOMINACIÓN MUNDIAL
/**
 * Utilidades para manejo de zonas horarias en DentiaGest
 * Preparado para expansión internacional 🚀
 */

// 🏥 TIMEZONE POR DEFECTO DE LA CLÍNICA
// TODO: Esto debería venir de la configuración de la clínica en el backend
export const CLINIC_TIMEZONE = 'America/Argentina/Buenos_Aires';

// 🌍 ZONAS HORARIAS SOPORTADAS PARA CONQUISTA MUNDIAL
export const SUPPORTED_TIMEZONES = {
  // América
  'America/Argentina/Buenos_Aires': 'Buenos Aires (GMT-3)',
  'America/Sao_Paulo': 'São Paulo (GMT-3)',
  'America/New_York': 'Nueva York (GMT-5)',
  'America/Los_Angeles': 'Los Ángeles (GMT-8)',
  'America/Mexico_City': 'Ciudad de México (GMT-6)',
  
  // Europa
  'Europe/Madrid': 'Madrid (GMT+1)',
  'Europe/London': 'Londres (GMT+0)',
  'Europe/Paris': 'París (GMT+1)',
  'Europe/Rome': 'Roma (GMT+1)',
  
  // Asia
  'Asia/Tokyo': 'Tokio (GMT+9)',
  'Asia/Shanghai': 'Shanghái (GMT+8)',
  'Asia/Dubai': 'Dubái (GMT+4)',
};

/**
 * Convierte una fecha de la zona horaria de la clínica a string local
 */
export const formatLocalDateTime = (date: Date, timezone: string = CLINIC_TIMEZONE): string => {
  try {
    // Usar Intl.DateTimeFormat para conversión precisa
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const formatted = formatter.format(date);
    return formatted.replace(' ', 'T');
  } catch (error) {
    console.error('❌ Error formatting date with timezone:', error);
    // Fallback al método actual
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
};

/**
 * Parsea una fecha string asumiendo que está en timezone de la clínica
 */
export const parseClinicDateTime = (dateStr: string, timezone: string = CLINIC_TIMEZONE): Date => {
  try {
    // Si es solo fecha, agregar hora por defecto
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      dateStr = dateStr + 'T09:00:00';
    }
    
    // SOLUCIÓN: Limpiar timezone indicators (Z, +XX:XX, etc.)
    let cleanDateStr = dateStr.replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
    
    // Crear fecha asumiendo timezone de la clínica
    const [datePart, timePart] = cleanDateStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second = 0] = timePart.split(':').map(Number);
    
    // Crear fecha local explícitamente (sin timezone)
    const result = new Date(year, month - 1, day, hour, minute, second);
    return result;
  } catch (error) {
    console.error('❌ Error parsing clinic date:', error, 'dateStr:', dateStr);
    return new Date(dateStr);
  }
};

/**
 * Obtiene la zona horaria del usuario para mostrar información
 */
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'UTC';
  }
};

/**
 * Muestra warning si la zona del usuario es diferente a la clínica
 */
export const checkTimezoneWarning = (clinicTimezone: string = CLINIC_TIMEZONE): { 
  showWarning: boolean; 
  message: string; 
} => {
  const userTimezone = getUserTimezone();
  
  if (userTimezone !== clinicTimezone) {
    return {
      showWarning: true,
      message: `⚠️ Estás viendo horarios en zona ${clinicTimezone}. Tu zona es ${userTimezone}.`
    };
  }
  
  return { showWarning: false, message: '' };
};
