import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })

  // Cerrar sesión en Supabase
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
