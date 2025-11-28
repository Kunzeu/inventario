import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener productos demo
    const { data: products } = await supabase
      .from('products')
      .select('id, sku, price')
      .like('sku', 'WC-DEMO-%')
      .eq('is_active', true)
      .limit(5)

    if (!products || products.length === 0) {
      return NextResponse.json({ 
        error: 'Primero debes sincronizar productos demo' 
      }, { status: 400 })
    }

    // Pedidos de ejemplo
    const demoOrders = [
      {
        sale_number: 'WC-DEMO-001',
        customer_name: 'Juan Pérez',
        customer_email: 'juan.perez@example.com',
        customer_phone: '+57 300 123 4567',
        items: [
          { sku: products[0]?.sku || 'WC-DEMO-001', quantity: 2, price: products[0]?.price || 25000 },
          { sku: products[1]?.sku || 'WC-DEMO-002', quantity: 1, price: products[1]?.price || 85000 },
        ],
        payment_method: 'card',
      },
      {
        sale_number: 'WC-DEMO-002',
        customer_name: 'María García',
        customer_email: 'maria.garcia@example.com',
        customer_phone: '+57 301 234 5678',
        items: [
          { sku: products[2]?.sku || 'WC-DEMO-003', quantity: 1, price: products[2]?.price || 120000 },
        ],
        payment_method: 'cash',
      },
      {
        sale_number: 'WC-DEMO-003',
        customer_name: 'Carlos Rodríguez',
        customer_email: 'carlos.rodriguez@example.com',
        customer_phone: '+57 302 345 6789',
        items: [
          { sku: products[3]?.sku || 'WC-DEMO-004', quantity: 1, price: products[3]?.price || 150000 },
          { sku: products[4]?.sku || 'WC-DEMO-005', quantity: 1, price: products[4]?.price || 300000 },
        ],
        payment_method: 'transfer',
      },
    ]

    let synced = 0

    for (const order of demoOrders) {
      // Verificar si la venta ya existe
      const { data: existingSale } = await supabase
        .from('sales')
        .select('id')
        .eq('sale_number', order.sale_number)
        .single()

      if (existingSale) {
        continue // Ya existe, saltar
      }

      // Crear o obtener cliente
      let customerId = null
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', order.customer_email)
        .eq('is_active', true)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        const { data: newCustomer, error: custError } = await supabase
          .from('customers')
          .insert({
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            is_active: true,
          })
          .select()
          .single()

        if (!custError && newCustomer) {
          customerId = newCustomer.id
        }
      }

      // Calcular totales
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.19 // 19% IVA
      const total = subtotal + tax

      // Crear venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: session.user.id,
          customer_id: customerId,
          sale_number: order.sale_number,
          subtotal,
          tax,
          total,
          payment_method: order.payment_method,
          status: 'completed',
        })
        .select()
        .single()

      if (saleError) {
        console.error('Error creating sale:', saleError)
        continue
      }

      // Crear items de venta
      const saleItems = []
      for (const item of order.items) {
        const product = products.find(p => p.sku === item.sku)
        if (product) {
          saleItems.push({
            sale_id: sale.id,
            product_id: product.id,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })
        }
      }

      if (saleItems.length > 0) {
        await supabase
          .from('sale_items')
          .insert(saleItems)
      }

      synced++
    }

    return NextResponse.json({ 
      success: true, 
      synced,
      total: demoOrders.length 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear pedidos demo' }, { status: 500 })
  }
}

