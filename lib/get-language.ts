import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Obtiene el idioma configurado en la empresa
 * @returns Idioma ('es' o 'en')
 */
export async function getCompanyLanguage(): Promise<'es' | 'en'> {
  const supabase = createServerSupabaseClient()
  
  const { data } = await supabase
    .from('company_settings')
    .select('language')
    .single()
  
  return (data?.language as 'es' | 'en') || 'es'
}

