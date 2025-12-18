import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let client: ReturnType<typeof createClientComponentClient<Database>> | undefined

export const createSupabaseClient = () => {
  if (client) return client

  client = createClientComponentClient<Database>()
  return client
}

// Cliente directo solo si las variables están configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null

