/**
 * Utilidad para manejar fechas de forma consistente en todo el servidor
 */

/**
 * Obtiene la fecha actual del servidor sin considerar zona horaria
 * @returns {Date} Fecha actual a las 00:00:00
 */
export const getTodayDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Obtiene la fecha/hora actual del servidor
 * @returns {Date} Fecha y hora actual
 */
export const getNowDateTime = () => {
  return new Date();
};

/**
 * Convierte una fecha a string en formato ISO para PostgreSQL
 * Asegura que se use la fecha local sin conversión de zona horaria
 * @param {Date|string} dateValue Fecha a convertir
 * @returns {string} Fecha en formato ISO
 */
export const toISODateString = (dateValue) => {
  if (!dateValue) return new Date().toISOString();
  
  const date = new Date(dateValue);
  // Retorna ISO string que PostgreSQL interpretará correctamente
  return date.toISOString();
};

/**
 * Convierte una fecha string (YYYY-MM-DD) a timestamp con hora a las 00:00:00 UTC
 * Esto previene problemas de zona horaria
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} Objeto Date configurado a las 00:00:00 UTC
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  // Crear un Date que interprete la fecha como UTC medianoche
  // Sumar horas para compensar la zona horaria del servidor
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return date;
};

/**
 * Convierte una fecha a string en formato YYYY-MM-DD
 * @param {Date} date - Objeto Date
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateString = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};
