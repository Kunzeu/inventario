import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { WooCommerceService } from '@/lib/services/woocommerce'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener configuración de WooCommerce
    const { data: connection } = await supabase
      .from('woocommerce_connections')
      .select('*')
      .eq('is_active', true)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'No hay conexión configurada' },
        { status: 400 }
      )
    }

    const wcService = new WooCommerceService({
      storeUrl: connection.store_url,
      consumerKey: connection.consumer_key,
      consumerSecret: connection.consumer_secret,
    })

    let created = 0
    let updated = 0
    let page = 1
    const perPage = 100

    while (true) {
      const products = await wcService.getProducts(page, perPage)

      if (!products || products.length === 0) {
        break
      }

      for (const product of products) {
        try {
          const result = await wcService.syncProductToPOS(product, supabase)
          if (result.action === 'created') {
            created++
          } else if (result.action === 'updated') {
            updated++
          }
        } catch (error: any) {
          console.error(`Error sincronizando producto ${product.id}:`, error)
        }
      }

      if (products.length < perPage) {
        break
      }

      page++
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al sincronizar productos' },
      { status: 500 }
    )
  }
}

