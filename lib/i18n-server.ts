import es from '@/locales/es.json'
import en from '@/locales/en.json'

type TranslationKey = keyof typeof es | string

const translations = {
  es,
  en,
}

/**
 * Obtiene una traducción en Server Components
 * @param key - Clave de traducción (ej: "dashboard.title")
 * @param lang - Idioma (por defecto: "es")
 * @returns Traducción o la clave si no se encuentra
 */
export function getTranslation(key: TranslationKey, lang: 'es' | 'en' = 'es'): string {
  const keys = key.split('.')
  let value: any = translations[lang]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value]
    } else {
      // Si no se encuentra, intentar con español como fallback
      if (lang !== 'es') {
        return getTranslation(key, 'es')
      }
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

/**
 * Obtiene traducciones con prefijo
 * @param prefix - Prefijo (ej: "dashboard")
 * @param lang - Idioma (por defecto: "es")
 * @returns Objeto con las traducciones
 */
export function getTranslations(prefix: string, lang: 'es' | 'en' = 'es'): Record<string, string> {
  const keys = prefix.split('.')
  let value: any = translations[lang]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value]
    } else {
      return {}
    }
  }

  return typeof value === 'object' ? value : {}
}

