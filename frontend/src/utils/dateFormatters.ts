// 🔥 APOLLO NUCLEAR - DATE FORMATTERS
// Mission: Convert Selene's timestamp format to human-readable formats
// NO SIMULACIONES - REAL DATE CONVERSION

/**
 * Converts a timestamp (number or string) to ISO date format (YYYY-MM-DD)
 * Handles Selene's timestamp format: "487652400000" -> "1985-06-12"
 * 
 * @param timestamp - Unix timestamp in milliseconds (number or string)
 * @returns ISO date string (YYYY-MM-DD) or empty string if invalid
 */
export function formatTimestampToISODate(timestamp: string | number | null | undefined): string {
  if (!timestamp) return '';
  
  try {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isNaN(ts)) return '';
    
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
}

/**
 * Converts a timestamp to a human-readable date string
 * Example: "487652400000" -> "12 de junio de 1985"
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - Locale for formatting (default: 'es-ES')
 * @returns Formatted date string
 */
export function formatTimestampToReadable(
  timestamp: string | number | null | undefined,
  locale: string = 'es-ES'
): string {
  if (!timestamp) return 'N/A';
  
  try {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isNaN(ts)) return 'N/A';
    
    const date = new Date(ts);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'N/A';
  }
}

/**
 * Converts ISO date string (YYYY-MM-DD) to timestamp
 * Example: "1985-06-12" -> 487652400000
 * 
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Unix timestamp in milliseconds or null if invalid
 */
export function convertISODateToTimestamp(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return null;
    
    return date.getTime();
  } catch (error) {
    console.error('Error converting ISO date:', error);
    return null;
  }
}

/**
 * Calculate age from timestamp
 * Example: "487652400000" -> 39 (in 2025)
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Age in years or null if invalid
 */
export function calculateAgeFromTimestamp(timestamp: string | number | null | undefined): number | null {
  if (!timestamp) return null;
  
  try {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isNaN(ts)) return null;
    
    const birthDate = new Date(ts);
    if (isNaN(birthDate.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
}
