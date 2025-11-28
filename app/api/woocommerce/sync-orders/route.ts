import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { WooCommerceService } from '@/lib/services/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener conexión
    const { data: connection } = await supabase
      .from('woocommerce_connections')
      .select('*')
      .eq('is_active', true)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'No hay conexión configurada' }, { status: 400 })
    }

    const service = new WooCommerceService({
      store_url: connection.store_url,
      consumer_key: connection.consumer_key,
      consumer_secret: connection.consumer_secret,
    })

    // Obtener pedidos recientes
    const orders = await service.getOrders(1, 100)
    let synced = 0
    const errors: string[] = []

    for (const order of orders) {
      try {
        await service.syncOrderToPOS(order, session.user.id, supabase)
        synced++
      } catch (error: any) {
        errors.push(`Pedido ${order.id}: ${error.message}`)
        console.error('Error syncing order:', order.id, error)
      }
    }

    // Actualizar última sincronización
    await supabase
      .from('woocommerce_connections')
      .update({ 
        last_sync: new Date().toISOString(),
        sync_orders: true,
      })
      .eq('id', connection.id)

    return NextResponse.json({ 
      success: true, 
      synced,
      total: orders.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al sincronizar' }, { status: 500 })
  }
}

