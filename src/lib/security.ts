/**
 * Utilidades de seguridad para prevenir inyecciones y ataques
 */

/**
 * Sanitiza strings para prevenir inyección NoSQL y XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remover caracteres peligrosos para NoSQL injection
  return input
    .replace(/[{}$]/g, '') // Operadores de MongoDB
    .trim()
    .slice(0, 200); // Limitar longitud
}

/**
 * Sanitiza números para evitar valores inválidos
 */
export function sanitizeNumber(input: any): number | undefined {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return undefined;
  if (num < 0 || num > 999999999) return undefined; // Rango razonable
  return num;
}

/**
 * Valida que un ObjectId de MongoDB sea válido
 */
export function isValidObjectId(id: string): boolean {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitiza un objeto completo recursivamente
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number') {
    return sanitizeNumber(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      // Ignorar propiedades con $ o . (operadores de MongoDB)
      if (!key.includes('$') && !key.includes('.')) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Valida campos de texto del lado del servidor
 */
export function validateTextInput(input: string, minLength: number = 1, maxLength: number = 200): boolean {
  if (typeof input !== 'string') return false;
  const trimmed = input.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Valida un email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
}

/**
 * Limita la longitud de arrays para prevenir ataques de DoS
 */
export function limitArrayLength<T>(arr: T[], maxLength: number = 50): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, maxLength);
}
