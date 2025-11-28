/**
 * Servicio para sincronización con WooCommerce
 */

interface WooCommerceConfig {
  store_url: string
  consumer_key: string
  consumer_secret: string
}

export class WooCommerceService {
  private config: WooCommerceConfig

  constructor(config: WooCommerceConfig) {
    this.config = config
  }

  /**
   * Obtiene productos de WooCommerce
   */
  async getProducts(page: number = 1, perPage: number = 100) {
    const url = `${this.config.store_url}/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`
    
    // Usar Buffer para Node.js o btoa para navegador
    const authString = typeof btoa !== 'undefined' 
      ? btoa(`${this.config.consumer_key}:${this.config.consumer_secret}`)
      : Buffer.from(`${this.config.consumer_key}:${this.config.consumer_secret}`).toString('base64')
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al obtener productos de WooCommerce: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Sincroniza un producto desde WooCommerce al sistema POS
   */
  async syncProductToPOS(wooProduct: any, supabase: any) {
    // Obtener o crear categoría
    let categoryId = null
    if (wooProduct.categories && wooProduct.categories.length > 0) {
      const categoryName = wooProduct.categories[0].name
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .eq('is_active', true)
        .single()

      if (existingCategory) {
        categoryId = existingCategory.id
      } else {
        const { data: newCategory, error: catError } = await supabase
          .from('categories')
          .insert({ name: categoryName, is_active: true })
          .select()
          .single()
        if (!catError && newCategory) categoryId = newCategory.id
      }
    }

    const product = {
      sku: wooProduct.sku || `WC-${wooProduct.id}`,
      name: wooProduct.name,
      description: wooProduct.description || null,
      price: parseFloat(wooProduct.price || 0),
      cost: parseFloat(wooProduct.regular_price || wooProduct.price || 0) || null,
      stock: parseInt(wooProduct.stock_quantity || 0),
      min_stock: 0,
      barcode: wooProduct.sku || null,
      image_url: wooProduct.images?.[0]?.src || null,
      category_id: categoryId,
      is_active: wooProduct.status === 'publish',
    }

    // Verificar si el producto ya existe
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', product.sku)
      .single()

    if (existing) {
      // Actualizar producto existente
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', existing.id)

      if (error) throw error
      return { id: existing.id, action: 'updated' }
    } else {
      // Crear nuevo producto
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw error
      return { id: data.id, action: 'created' }
    }
  }

  /**
   * Obtiene pedidos de WooCommerce
   */
  async getOrders(page: number = 1, perPage: number = 100) {
    const url = `${this.config.store_url}/wp-json/wc/v3/orders?page=${page}&per_page=${perPage}&status=completed&orderby=date&order=desc`
    
    // Usar Buffer para Node.js o btoa para navegador
    const authString = typeof btoa !== 'undefined' 
      ? btoa(`${this.config.consumer_key}:${this.config.consumer_secret}`)
      : Buffer.from(`${this.config.consumer_key}:${this.config.consumer_secret}`).toString('base64')
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al obtener pedidos de WooCommerce: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Sincroniza un pedido de WooCommerce al sistema POS
   */
  async syncOrderToPOS(wooOrder: any, userId: string, supabase: any) {
    // Verificar si la venta ya existe
    const { data: existingSale } = await supabase
      .from('sales')
      .select('id')
      .eq('sale_number', `WC-${wooOrder.id}`)
      .single()

    if (existingSale) {
      return { id: existingSale.id, action: 'skipped' }
    }

    // Crear o obtener cliente
    let customerId = null
    if (wooOrder.billing?.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', wooOrder.billing.email)
        .eq('is_active', true)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        // Crear nuevo cliente
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({
            name: `${wooOrder.billing.first_name || ''} ${wooOrder.billing.last_name || ''}`.trim() || wooOrder.billing.email,
            email: wooOrder.billing.email,
            phone: wooOrder.billing.phone || null,
            address: `${wooOrder.billing.address_1 || ''}, ${wooOrder.billing.city || ''}`.trim() || null,
            is_active: true,
          })
          .select()
          .single()

        if (error) throw error
        customerId = newCustomer.id
      }
    }

    // Calcular totales
    const subtotal = parseFloat(wooOrder.total || 0) - parseFloat(wooOrder.total_tax || 0)
    const tax = parseFloat(wooOrder.total_tax || 0)
    const total = parseFloat(wooOrder.total || 0)

    // Crear venta
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: userId,
        customer_id: customerId,
        sale_number: `WC-${wooOrder.id}`,
        subtotal,
        tax,
        total,
        payment_method: this.mapPaymentMethod(wooOrder.payment_method),
        status: wooOrder.status === 'completed' ? 'completed' : 'pending',
      })
      .select()
      .single()

    if (saleError) throw saleError

    // Mapear y crear items de venta
    const saleItems = []
    for (const item of wooOrder.line_items || []) {
      // Buscar producto por SKU o crear referencia
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('sku', item.sku || `WC-${item.product_id}`)
        .eq('is_active', true)
        .single()

      if (product) {
        saleItems.push({
          sale_id: sale.id,
          product_id: product.id,
          quantity: parseInt(item.quantity || 1),
          price: parseFloat(item.price || 0),
          total: parseFloat(item.total || 0),
        })
      }
    }

    if (saleItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError
    }

    return sale
  }

  /**
   * Mapea métodos de pago de WooCommerce al sistema POS
   */
  private mapPaymentMethod(wcMethod: string): string {
    const methodMap: { [key: string]: string } = {
      'bacs': 'transfer',
      'cheque': 'transfer',
      'cod': 'cash',
      'paypal': 'card',
      'stripe': 'card',
      'card': 'card',
    }

    return methodMap[wcMethod.toLowerCase()] || 'cash'
  }

  /**
   * Sincroniza todos los productos
   */
  async syncAllProducts(supabase: any) {
    let page = 1
    let hasMore = true
    const results = []

    while (hasMore) {
      const products = await this.getProducts(page, 100)
      
      for (const product of products) {
        const result = await this.syncProductToPOS(product, supabase)
        results.push(result)
      }

      hasMore = products.length === 100
      page++
    }

    return results
  }
}

