import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, TrendingUp, TrendingDown, Package } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'
import { getLocaleFromCurrency } from '@/lib/currency-locale'

async function getInventoryData() {
  const supabase = createServerSupabaseClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('stock', { ascending: true })

  const lowStock = products?.filter(p => Number(p.stock) <= Number(p.min_stock)) || []
  const outOfStock = products?.filter(p => Number(p.stock) <= 0) || []
  const totalValue = products?.reduce((sum, p) => sum + (Number(p.stock) * Number(p.cost || p.price)), 0) || 0

  // Obtener movimientos recientes
  const { data: movements } = await supabase
    .from('stock_movements')
    .select(`
      *,
      products (name, sku)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return {
    products: products || [],
    lowStock,
    outOfStock,
    totalValue,
    movements: movements || [],
  }
}

export default async function InventoryPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const inventoryData = await getInventoryData()
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const t = (key: string) => getTranslation(key, lang)

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('inventory.title')}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inventory.lowStock')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryData.lowStock.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inventory.outOfStock')}</CardTitle>
              <Package className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryData.outOfStock.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inventory.totalValue')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${inventoryData.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('inventory.lowStock')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t('inventory.sku')}</th>
                    <th className="text-left p-4">{t('inventory.name')}</th>
                    <th className="text-left p-4">{t('inventory.currentStock')}</th>
                    <th className="text-left p-4">{t('inventory.minStock')}</th>
                    <th className="text-left p-4">{t('inventory.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.lowStock.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-4">{product.sku}</td>
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">
                        <span className={Number(product.stock) <= 0 ? 'text-red-600 font-bold' : 'text-yellow-600 font-bold'}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4">{product.min_stock}</td>
                      <td className="p-4">
                        {Number(product.stock) <= 0 ? (
                          <span className="text-red-600">{t('inventory.outOfStockStatus')}</span>
                        ) : (
                          <span className="text-yellow-600">{t('inventory.lowStockStatus')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {inventoryData.lowStock.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">{t('inventory.currentStock')}: </span>
                          <span className={Number(product.stock) <= 0 ? 'text-red-600 font-bold' : 'text-yellow-600 font-bold'}>
                            {product.stock}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('inventory.minStock')}: </span>
                          <span>{product.min_stock}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">{t('inventory.status')}: </span>
                          {Number(product.stock) <= 0 ? (
                            <span className="text-red-600">{t('inventory.outOfStockStatus')}</span>
                          ) : (
                            <span className="text-yellow-600">{t('inventory.lowStockStatus')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('inventory.recentMovements')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventoryData.movements.map((movement: any) => (
                <div key={movement.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{movement.products?.name || 'Producto'}</p>
                    <p className="text-sm text-gray-500">
                      {movement.products?.sku || ''} • {movement.movement_type} • {new Date(movement.created_at).toLocaleString(locale)}
                    </p>
                  </div>
                  <div className={`font-bold ${movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

