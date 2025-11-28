/**
 * Funciones de validación para formularios
 */

export function isValidEmail(email: string): boolean {
  if (!email || email.trim().length === 0) {
    return false
  }

  // Longitud mínima razonable para un email (ej: a@b.co = 5 caracteres)
  // Pero en la práctica, emails válidos suelen tener al menos 6-8 caracteres
  if (email.length < 5) {
    return false
  }

  // Validación básica de formato email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateEmail(email: string, required: boolean = false): string | null {
  if (!email || email.trim().length === 0) {
    if (required) {
      return 'El email es requerido'
    }
    return null // Email vacío es válido si no es requerido
  }

  if (email.length < 5) {
    return 'El email debe tener al menos 5 caracteres'
  }

  if (!isValidEmail(email)) {
    return 'El formato del email no es válido'
  }

  return null // Email válido
}

