'use client'

import { Toaster } from 'react-hot-toast'
import { I18nextProvider } from 'react-i18next'
import { useEffect } from 'react'
import i18n from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase/client'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Detectar idioma desde la configuración de la empresa
    const loadLanguage = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const { data } = await supabase
            .from('company_settings')
            .select('language')
            .single()
          
          if (data?.language && data.language !== i18n.language) {
            await i18n.changeLanguage(data.language)
          }
        }
      } catch (error) {
        // Si hay error, mantener el idioma por defecto
        console.error('Error loading language:', error)
      }
    }
    
    loadLanguage()
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      {children}
      <Toaster position="top-right" />
    </I18nextProvider>
  )
}

