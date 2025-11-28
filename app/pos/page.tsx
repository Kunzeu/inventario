'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, generateSaleNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCompanyCurrencyClient } from '@/lib/get-currency-client'
import { CustomerSelector } from '@/components/pos/customer-selector'

interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  total: number
}

export default function POSPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [currency, setCurrency] = useState('COP')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProducts()
    loadCurrency()
  }, [])

  const loadCurrency = async () => {
    const currencyValue = await getCompanyCurrencyClient()
    setCurrency(currencyValue)
  }

  const loadProducts = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .gt('stock', 0)

    if (data) setProducts(data)
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.product_id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error(t('pos.insufficientStock'))
        return
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        total: Number(product.price)
      }])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQuantity = item.quantity + delta
        if (newQuantity <= 0) return item
        return { ...item, quantity: newQuantity, total: newQuantity * item.price }
      }
      return item
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const calculateDiscount = (points: number) => {
    // 100 puntos = 1% de descuento, máximo 10%
    return Math.min(Math.floor(points / 100), 10)
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
    
    // Calcular descuento si hay cliente seleccionado
    let discount = 0
    let discountPercent = 0
    if (selectedCustomer && selectedCustomer.loyalty_points) {
      discountPercent = calculateDiscount(selectedCustomer.loyalty_points)
      discount = subtotal * (discountPercent / 100)
    }
    
    const subtotalAfterDiscount = subtotal - discount
    const tax = subtotalAfterDiscount * 0.19 // 19% IVA
    const total = subtotalAfterDiscount + tax
    
    return { subtotal, discount, discountPercent, tax, total }
  }

  const handleCustomerSelect = async (id: string | null) => {
    setCustomerId(id)
    if (id) {
      // Cargar información completa del cliente
      const { data } = await supabase
        .from('customers')
        .select('id, name, email, phone, loyalty_points')
        .eq('id', id)
        .eq('is_active', true)
        .single()
      
      if (data) {
        setSelectedCustomer(data)
      }
    } else {
      setSelectedCustomer(null)
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error(t('pos.emptyCart'))
      return
    }

    // Validar monto recibido si es efectivo
    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived) || 0
      const { total } = calculateTotal()
      if (received < total) {
        toast.error(t('pos.insufficientCash'))
        return
      }
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión')

      const { subtotal, discount, tax, total } = calculateTotal()
      const saleNumber = generateSaleNumber()

      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: session.user.id,
          customer_id: customerId,
          sale_number: saleNumber,
          subtotal,
          discount: discount || 0,
          tax,
          total,
          payment_method: paymentMethod,
          status: 'completed'
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Crear los items de venta (solo campos requeridos)
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.total)
        // discount es opcional, no lo incluimos si no hay descuento
      }))

      console.log('Intentando insertar sale_items:', saleItems)

      const { error: itemsError, data: insertedItems } = await supabase
        .from('sale_items')
        .insert(saleItems)
        .select()

      if (itemsError) {
        console.error('Error al insertar sale_items:', itemsError)
        throw new Error(`Error al crear items de venta: ${itemsError.message}`)
      }

      console.log('Items de venta creados:', insertedItems)

      // Actualizar stock de productos y crear movimientos de stock
      for (const item of cart) {
        // Obtener el stock actual del producto
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()

        if (productError) {
          console.error(`Error al obtener producto ${item.product_id}:`, productError)
          continue
        }

        const newStock = Number(product.stock) - item.quantity

        // Actualizar el stock del producto
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id)

        if (updateError) {
          console.error(`Error al actualizar stock de producto ${item.product_id}:`, updateError)
          continue
        }

        // Crear movimiento de stock
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            product_id: item.product_id,
            movement_type: 'out',
            quantity: item.quantity,
            reference_type: 'sale',
            reference_id: sale.id,
            notes: `Venta ${saleNumber}`
          })

        if (movementError) {
          console.error(`Error al crear movimiento de stock para producto ${item.product_id}:`, movementError)
          // No lanzamos error aquí para no interrumpir la venta
        }
      }

      // Actualizar puntos de lealtad si hay cliente
      if (customerId && selectedCustomer) {
        // Calcular puntos ganados: 1 punto por cada producto comprado (cantidad)
        // Ejemplo: Si compra 3 unidades del producto A y 2 del producto B = 5 puntos
        const pointsEarned = cart.reduce((sum, item) => sum + item.quantity, 0)
        const newPoints = (selectedCustomer.loyalty_points || 0) + pointsEarned
        
        await supabase
          .from('customers')
          .update({ loyalty_points: newPoints })
          .eq('id', customerId)
      }

      toast.success(t('pos.saleCompleted'))
      setCart([])
      setCustomerId(null)
      setSelectedCustomer(null)
      setCashReceived('')
      router.refresh()
      loadProducts()
    } catch (error: any) {
      console.error('Error completo en checkout:', error)
      const errorMessage = error?.message || error?.details || JSON.stringify(error) || t('pos.error')
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totals = calculateTotal()

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('pos.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <Input
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                      <p className="text-lg font-bold mt-2">{formatCurrency(Number(product.price), currency)}</p>
                      <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carrito */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t('pos.cart')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CustomerSelector 
                  customerId={customerId} 
                  onCustomerSelect={handleCustomerSelect}
                />
                
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{t('pos.emptyCart')}</p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(item.price, currency)} c/u</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product_id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product_id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="ml-4 font-bold">{formatCurrency(item.total, currency)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>{t('pos.subtotal')}:</span>
                        <span>{formatCurrency(totals.subtotal, currency)}</span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>{t('pos.discount')} ({totals.discountPercent}%):</span>
                          <span>-{formatCurrency(totals.discount, currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>{t('pos.tax')} (19%):</span>
                        <span>{formatCurrency(totals.tax, currency)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>{t('pos.total')}:</span>
                        <span>{formatCurrency(totals.total, currency)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">{t('pos.paymentMethod')}</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value)
                          if (e.target.value !== 'cash') {
                            setCashReceived('')
                          }
                        }}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="cash">{t('pos.cash')}</option>
                        <option value="card">{t('pos.card')}</option>
                        <option value="transfer">{t('pos.transfer')}</option>
                      </select>
                    </div>

                    {paymentMethod === 'cash' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">{t('pos.cashReceived')}</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder="0.00"
                          className="w-full"
                        />
                        {cashReceived && parseFloat(cashReceived) >= totals.total && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-green-800">{t('pos.change')}:</span>
                              <span className="text-xl font-bold text-green-800">
                                {formatCurrency(parseFloat(cashReceived) - totals.total, currency)}
                              </span>
                            </div>
                          </div>
                        )}
                        {cashReceived && parseFloat(cashReceived) < totals.total && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              {t('pos.insufficientCash')}: {formatCurrency(totals.total - parseFloat(cashReceived), currency)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      disabled={loading || cart.length === 0 || (paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < totals.total))}
                    >
                      {loading ? t('common.loading') : t('pos.checkout')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

