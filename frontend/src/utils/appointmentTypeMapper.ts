/**
 * 🧠 SMART APPOINTMENT TYPE MAPPER - DENTIAGEST
 * 
 * Purpose: Convert crazy real-world appointment types to standardized ones
 * Created: August 11, 2025 - "The Great Standardization"
 * 
 * WHY THIS EXISTS:
 * - Real dentists write: "Endodoncia y corona", "extraccion", "Consulta de dolor"
 * - System needs: "treatment", "extraction", "consultation" 
 * - This mapper bridges the gap with SMART detection
 * 
 * @author Punk Claude & The Standardization Army
 */

// 🎯 SIMPLE 4-CATEGORY SYSTEM (what dentists actually need)
export type SimpleAppointmentCategory = 
  | 'consultation'    // 🟢 Verde - Consultas, seguimientos, revisiones
  | 'treatment'       // � Amarillo - TODO lo que es tratamiento activo
  | 'cleaning'        // � Azul - Limpiezas e higiene
  | 'emergency';      // 🔴 Rojo - Solo emergencias reales

/**
 * 🧠 SUPER SIMPLE MAPPER - 4 colors, zero confusion
 * 
 * Logic:
 * - Verde: Consultas, seguimientos, revisiones (diagnostic stuff)
 * - Amarillo: TODO tratamiento activo (drilling, fixing, surgery, etc.)
 * - Azul: Limpiezas (hygiene only)
 * - Rojo: Emergencias (pain, trauma)
 */
export function mapAppointmentType(rawType: string): SimpleAppointmentCategory {
  if (!rawType || typeof rawType !== 'string') {
    return 'consultation'; // Safe fallback
  }
  
  // Normalize
  const normalized = rawType.toLowerCase().trim();
  
  // 🚨 EMERGENCIAS (highest priority)
  if (/(urgencia|emergencia|dolor agudo|trauma|emergency)/i.test(rawType)) {
    return 'emergency';
  }
  
  // 🔵 LIMPIEZAS (specific and clear)
  if (/(limpieza|higiene|profilaxis|cleaning|tartrectomia)/i.test(rawType)) {
    return 'cleaning';
  }
  
  // 🟡 TRATAMIENTOS (everything that "fixes" something)
  if (/(endodoncia|corona|puente|protesis|implante|empaste|obturacion|composite|extraccion|extracion|cirugia|cirugía|ortodoncia|ortodoncio|brackets|invisalign|surgery|extraction|filling|treatment|tratamiento|biopsia|muela.*juicio|cordal|alineadores|retenedores)/i.test(rawType)) {
    return 'treatment';
  }
  
  // 🟢 CONSULTAS (everything else - diagnostic, checkups, follow-ups)
  // This includes: consulta, revision, control, seguimiento, valoracion, etc.
  return 'consultation';
}

/**
 * 🎨 GET APPOINTMENT COLOR - SUPER SIMPLE 4-COLOR SYSTEM
 * 
 * Priority logic:
 * 1. Priority overrides type (urgent=red, high=orange)  
 * 2. Type determines base color (green, yellow, blue, red)
 */
export function getAppointmentColor(rawType: string, priority?: string) {
  // Priority overrides everything (same as before)
  if (priority === 'urgent') return '#dc2626'; // Red
  if (priority === 'high') return '#ea580c'; // Orange
  
  // Get simple category
  const category = mapAppointmentType(rawType);
  
  // 4-color system (NO CONFUSION!)
  const colorMap: Record<SimpleAppointmentCategory, string> = {
    consultation: '#16a34a',    // 🟢 Green - consultations, checkups, follow-ups
    treatment: '#eab308',       // 🟡 Yellow - all active treatments (drilling, surgery, etc.)
    cleaning: '#2563eb',        // 🔵 Blue - hygiene only
    emergency: '#dc2626'        // 🔴 Red - emergencies
  };
  
  return colorMap[category] || '#16a34a'; // Green fallback
}

// 🏥 EXPORT EVERYTHING FOR EASY IMPORT
export default {
  mapAppointmentType,
  getAppointmentColor
};

