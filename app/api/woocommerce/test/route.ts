import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { WooCommerceService } from '@/lib/services/woocommerce'

export async function POST(request: Request) {
  try {
    const { storeUrl, consumerKey, consumerSecret } = await request.json()

    if (!storeUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const wcService = new WooCommerceService({
      storeUrl,
      consumerKey,
      consumerSecret,
    })

    // Intentar obtener productos para verificar la conexión
    const products = await wcService.getProducts(1, 1)

    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al probar la conexión' },
      { status: 400 }
    )
  }
}

