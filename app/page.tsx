import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Home() {
  // Verificar si las variables de entorno están configuradas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/setup')
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      redirect('/auth/login')
    } else {
      redirect('/dashboard')
    }
  } catch (error) {
    // Si hay error, redirigir a setup
    redirect('/setup')
  }
}

