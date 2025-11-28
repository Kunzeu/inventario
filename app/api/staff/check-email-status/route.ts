import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario actual tenga permisos de admin
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!userData || (userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden verificar el estado de emails' },
        { status: 403 }
      )
    }

    // Usar el service role key para obtener información del usuario
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Obtener información del usuario
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      emailConfirmed: user.user?.email_confirmed_at !== null && user.user?.email_confirmed_at !== undefined
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al verificar estado del email' },
      { status: 500 }
    )
  }
}

