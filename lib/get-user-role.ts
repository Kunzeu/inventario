import { createServerSupabaseClient } from './supabase/server'

export async function getUserRole(): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  // Usar getUser() en lugar de getSession() para mejor confiabilidad
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return userData?.role || null
}

export async function getUser() {
  const supabase = createServerSupabaseClient()
  // Usar getUser() en lugar de getSession() para mejor confiabilidad
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id, email, full_name, role, is_active')
    .eq('id', user.id)
    .single()

  return userData
}

