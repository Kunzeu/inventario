import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar permisos (admin o el mismo usuario)
        const { data: currentUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (!currentUser || (currentUser.role !== 'admin' && session.user.id !== params.id)) {
            return NextResponse.json(
                { error: 'No tienes permisos para ver este usuario' },
                { status: 403 }
            )
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', params.id)
            .single()

        if (error) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(user)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Error al obtener usuario' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { full_name, role, is_active } = await request.json()
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Solo admin puede editar otros usuarios
        const { data: currentUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Solo los administradores pueden editar usuarios' },
                { status: 403 }
            )
        }

        // Si se está cambiando el rol, necesitamos usar el cliente admin
        if (role) {
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

            // Actualizar metadata del usuario en Auth si es necesario
            if (full_name) {
                const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                    params.id,
                    { user_metadata: { full_name } }
                )

                if (authError) {
                    throw authError
                }
            }
        }

        // Actualizar tabla users
        const updates: any = {}
        if (full_name !== undefined) updates.full_name = full_name
        if (role !== undefined) updates.role = role
        if (is_active !== undefined) updates.is_active = is_active

        const { data: user, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(user)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Error al actualizar usuario' },
            { status: 500 }
        )
    }
}
