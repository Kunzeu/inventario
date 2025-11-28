import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { storeUrl, consumerKey, consumerSecret } = await request.json()

    if (!storeUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 })
    }

    // Probar conexión
    const url = `${storeUrl}/wp-json/wc/v3/products?page=1&per_page=1`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Error de conexión: ${response.status} ${response.statusText}` 
      }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al probar conexión' }, { status: 500 })
  }
}

