'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, generatePurchaseNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCompanyCurrencyClient } from '@/lib/get-currency-client'

interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  total: number
}

export default function NewPurchasePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [currency, setCurrency] = useState('COP')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProducts()
    loadSuppliers()
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

    if (data) setProducts(data)
  }

  const loadSuppliers = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (data) setSuppliers(data)
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.product_id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: Number(product.cost || product.price),
        quantity: 1,
        total: Number(product.cost || product.price)
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

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.19 // 19% IVA
    return { subtotal, tax, total: subtotal + tax }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error(t('purchases.emptyCart'))
      return
    }

    if (!supplierId) {
      toast.error(t('purchases.selectSupplier'))
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión')

      const { subtotal, tax, total } = calculateTotal()
      const purchaseNumber = generatePurchaseNumber()

      // Crear la compra
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          supplier_id: supplierId,
          purchase_number: purchaseNumber,
          subtotal,
          tax,
          total,
          status: 'completed',
          notes: notes || null
        })
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // Crear los items de compra
      const purchaseItems = cart.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.total)
      }))

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems)

      if (itemsError) throw itemsError

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

        const newStock = Number(product.stock) + item.quantity

        // Actualizar el stock del producto
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id)

        if (updateError) {
          console.error(`Error al actualizar stock de producto ${item.product_id}:`, updateError)
          continue
        }

        // Crear movimiento de stock (entrada)
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            product_id: item.product_id,
            movement_type: 'in',
            quantity: item.quantity,
            reference_type: 'purchase',
            reference_id: purchase.id,
            notes: `Compra ${purchaseNumber}`
          })

        if (movementError) {
          console.error(`Error al crear movimiento de stock para producto ${item.product_id}:`, movementError)
        }
      }

      toast.success(t('purchases.purchaseCompleted'))
      router.push('/purchases')
      router.refresh()
    } catch (error: any) {
      console.error('Error completo en checkout:', error)
      const errorMessage = error?.message || error?.details || JSON.stringify(error) || t('purchases.error')
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
        <h1 className="text-3xl font-bold text-gray-900">{t('purchases.newPurchase')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('purchases.selectSupplier')}</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={supplierId || ''}
                  onChange={(e) => setSupplierId(e.target.value || null)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">{t('purchases.selectSupplier')}</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('pos.products')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => addToCart(product)}
                    >
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                      <p className="text-lg font-bold mt-2">{formatCurrency(Number(product.cost || product.price), currency)}</p>
                    </div>
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
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{t('pos.emptyCart')}</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(item.price, currency)} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.product_id)}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="ml-4 font-bold">{formatCurrency(item.total, currency)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('purchases.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>{t('pos.subtotal')}:</span>
                  <span>{formatCurrency(totals.subtotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pos.tax')} (19%):</span>
                  <span>{formatCurrency(totals.tax, currency)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('pos.total')}:</span>
                    <span>{formatCurrency(totals.total, currency)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">{t('purchases.notes')}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder={t('purchases.notes')}
                  />
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0 || !supplierId}
                  className="w-full mt-4"
                >
                  {loading ? t('common.loading') : t('purchases.completePurchase')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

