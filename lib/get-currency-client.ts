import { createSupabaseClient } from './supabase/client'
import { getLocaleFromCurrency } from './currency-locale'

/**
 * Obtiene la moneda configurada en la empresa (para client components)
 * @returns Moneda (USD, COP, EUR, etc.)
 */
export async function getCompanyCurrencyClient(): Promise<string> {
  const supabase = createSupabaseClient()
  
  const { data } = await supabase
    .from('company_settings')
    .select('currency')
    .single()
  
  return data?.currency || 'COP'
}

/**
 * Obtiene el locale según la moneda (para client components)
 * @returns Locale string (es-CO, en-US, es-ES, etc.)
 */
export async function getCompanyLocaleClient(): Promise<string> {
  const currency = await getCompanyCurrencyClient()
  return getLocaleFromCurrency(currency)
}

