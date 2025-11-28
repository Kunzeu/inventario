import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Home() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      redirect('/auth/login')
    } else {
      redirect('/dashboard')
    }
  } catch (error) {
    // Si hay error, redirigir a login
    redirect('/auth/login')
  }
}

