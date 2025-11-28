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
      store_url: connection.store_url,
      consumer_key: connection.consumer_key,
      consumer_secret: connection.consumer_secret,
    })

    let synced = 0
    let page = 1
    const perPage = 100

    while (true) {
      const orders = await wcService.getOrders(page, perPage)

      if (!orders || orders.length === 0) {
        break
      }

      for (const order of orders) {
        try {
          await wcService.syncOrderToPOS(order, session.user.id, supabase)
          synced++
        } catch (error: any) {
          console.error(`Error sincronizando pedido ${order.id}:`, error)
        }
      }

      if (orders.length < perPage) {
        break
      }

      page++
    }

    return NextResponse.json({
      success: true,
      synced,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al sincronizar pedidos' },
      { status: 500 }
    )
  }
}

