import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Productos de ejemplo para demo
    const demoProducts = [
      {
        sku: 'WC-DEMO-001',
        name: 'Camiseta Básica',
        description: 'Camiseta de algodón 100%',
        price: 25000,
        cost: 15000,
        stock: 50,
        min_stock: 10,
        barcode: 'WC-DEMO-001',
        is_active: true,
      },
      {
        sku: 'WC-DEMO-002',
        name: 'Pantalón Jeans',
        description: 'Pantalón jeans clásico',
        price: 85000,
        cost: 50000,
        stock: 30,
        min_stock: 5,
        barcode: 'WC-DEMO-002',
        is_active: true,
      },
      {
        sku: 'WC-DEMO-003',
        name: 'Zapatos Deportivos',
        description: 'Zapatos deportivos cómodos',
        price: 120000,
        cost: 80000,
        stock: 25,
        min_stock: 5,
        barcode: 'WC-DEMO-003',
        is_active: true,
      },
      {
        sku: 'WC-DEMO-004',
        name: 'Bolso de Cuero',
        description: 'Bolso elegante de cuero genuino',
        price: 150000,
        cost: 100000,
        stock: 15,
        min_stock: 3,
        barcode: 'WC-DEMO-004',
        is_active: true,
      },
      {
        sku: 'WC-DEMO-005',
        name: 'Reloj Inteligente',
        description: 'Reloj inteligente con múltiples funciones',
        price: 300000,
        cost: 200000,
        stock: 20,
        min_stock: 5,
        barcode: 'WC-DEMO-005',
        is_active: true,
      },
    ]

    let created = 0
    let updated = 0

    for (const product of demoProducts) {
      // Verificar si existe
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('sku', product.sku)
        .single()

      if (existing) {
        // Actualizar
        await supabase
          .from('products')
          .update(product)
          .eq('id', existing.id)
        updated++
      } else {
        // Crear
        await supabase
          .from('products')
          .insert(product)
        created++
      }
    }

    return NextResponse.json({ 
      success: true, 
      created, 
      updated,
      total: demoProducts.length 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear productos demo' }, { status: 500 })
  }
}

