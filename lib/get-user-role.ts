import { createServerSupabaseClient } from './supabase/server'

export async function getUserRole(): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  return user?.role || null
}

export async function getUser() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, email, full_name, role, is_active')
    .eq('id', session.user.id)
    .single()

  return user
}

