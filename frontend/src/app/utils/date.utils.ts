/**
 * Utilidades para manejo de fechas sin problemas de timezone
 */

/**
 * Parsea una fecha en formato YYYY-MM-DD a un objeto Date sin conversión de timezone
 * @param fechaStr Fecha en formato YYYY-MM-DD
 * @returns Objeto Date en timezone local
 */
export function parseFechaSinTimezone(fechaStr: string | Date): Date {
  if (!fechaStr) return new Date();
  
  // Si ya es un objeto Date, devolverlo
  if (fechaStr instanceof Date) return fechaStr;
  
  // Si está en formato YYYY-MM-DD, parsear sin timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Si tiene formato ISO completo (YYYY-MM-DDTHH:mm:ss.sssZ), extraer solo la fecha
  if (fechaStr.includes('T')) {
    const [datePart] = fechaStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Fallback: usar Date normal
  return new Date(fechaStr);
}

/**
 * Formatea una fecha a formato YYYY-MM-DD
 * @param fecha Objeto Date o string de fecha
 * @returns String en formato YYYY-MM-DD
 */
export function formatFechaYYYYMMDD(fecha: Date | string): string {
  if (!fecha) return '';
  
  const dateObj = fecha instanceof Date ? fecha : parseFechaSinTimezone(fecha);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha a formato legible en español
 * @param fecha String de fecha en formato YYYY-MM-DD
 * @param formato Opciones: 'corto' (DD/MM/YYYY), 'medio' (Ej: 2 dic 2025), 'largo' (Ej: 2 de diciembre de 2025)
 * @returns String formateado
 */
export function formatFechaLegible(fecha: string, formato: 'corto' | 'medio' | 'largo' = 'largo'): string {
  if (!fecha) return 'N/A';
  
  const dateObj = parseFechaSinTimezone(fecha);
  
  if (formato === 'corto') {
    const [year, month, day] = fecha.split('-');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  
  if (formato === 'medio') {
    return dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  // formato === 'largo'
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calcula los días restantes desde hoy hasta una fecha
 * @param fechaStr Fecha en formato YYYY-MM-DD
 * @returns Número de días (positivo = futuro, negativo = pasado)
 */
export function calcularDiasRestantes(fechaStr: string): number {
  if (!fechaStr) return 0;
  
  const fechaLimite = parseFechaSinTimezone(fechaStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
  
  const diferencia = fechaLimite.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 3600 * 24));
}

/**
 * Compara dos fechas sin considerar la hora
 * @param fecha1 Primera fecha
 * @param fecha2 Segunda fecha
 * @returns -1 si fecha1 < fecha2, 0 si son iguales, 1 si fecha1 > fecha2
 */
export function compararFechas(fecha1: string, fecha2: string): number {
  const date1 = parseFechaSinTimezone(fecha1);
  const date2 = parseFechaSinTimezone(fecha2);
  
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  
  if (date1.getTime() < date2.getTime()) return -1;
  if (date1.getTime() > date2.getTime()) return 1;
  return 0;
}
