import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClientComponentClient> | undefined

export const createSupabaseClient = () => {
  if (client) return client

  client = createClientComponentClient()
  return client
}

// Cliente directo solo si las variables están configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

