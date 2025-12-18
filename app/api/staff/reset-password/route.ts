import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()
    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email y nueva contraseña requeridos' }, { status: 400 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
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

    // Buscar usuario por email - listUsers no acepta filtro por email
    // Primero obtener todos los usuarios y filtrar
    const { data: allUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (searchError) {
      return NextResponse.json({ error: searchError.message }, { status: 500 })
    }
    
    const user = allUsers.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Cambiar contraseña
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    })
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al cambiar contraseña' }, { status: 500 })
  }
}
