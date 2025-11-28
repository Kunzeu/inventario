import { createServerSupabaseClient } from './supabase/server'
import { getLocaleFromCurrency } from './currency-locale'

/**
 * Obtiene la moneda configurada en la empresa
 * @returns Moneda (USD, COP, EUR, etc.)
 */
export async function getCompanyCurrency(): Promise<string> {
  const supabase = createServerSupabaseClient()
  
  const { data } = await supabase
    .from('company_settings')
    .select('currency')
    .single()
  
  return data?.currency || 'COP'
}

// Re-exportar getLocaleFromCurrency para mantener compatibilidad
export { getLocaleFromCurrency }

