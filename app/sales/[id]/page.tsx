import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'
import { getLocaleFromCurrency } from '@/lib/currency-locale'

async function getSaleDetails(saleId: string) {
  const supabase = createServerSupabaseClient()

  // Obtener información de la venta
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select(`
      *,
      customers (name, email, phone, address)
    `)
    .eq('id', saleId)
    .single()

  if (saleError || !sale) {
    return null
  }

  // Obtener información del vendedor si existe user_id
  let seller = null
  if (sale.user_id) {
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', sale.user_id)
      .single()
    
    seller = user
  }

  // Obtener items de la venta
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select(`
      *,
      products (name, sku, price)
    `)
    .eq('sale_id', saleId)
    .order('created_at', { ascending: true })

  return {
    sale: {
      ...sale,
      users: seller
    },
    items: saleItems || [],
  }
}

export default async function SaleDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const saleData = await getSaleDetails(params.id)
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const t = (key: string) => getTranslation(key, lang)

  if (!saleData) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('sales.saleDetails')}</h1>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">{t('sales.saleNotFound')}</p>
              <Link href="/sales">
                <Button className="mt-4">{t('common.back')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const { sale, items } = saleData

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/sales">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t('sales.saleDetails')}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la venta */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('sales.saleInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('sales.saleNumber')}</p>
                    <p className="font-semibold">{sale.sale_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('sales.date')}</p>
                    <p className="font-semibold">{formatDate(sale.created_at, locale)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('sales.status')}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.status === 'completed' ? t('sales.completed') : t('sales.pending')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('sales.paymentMethod')}</p>
                    <p className="font-semibold">
                      {sale.payment_method === 'cash' ? t('pos.cash') :
                       sale.payment_method === 'card' ? t('pos.card') :
                       sale.payment_method === 'transfer' ? t('pos.transfer') :
                       sale.payment_method}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('sales.items')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">{t('products.sku')}</th>
                        <th className="text-left p-4">{t('products.name')}</th>
                        <th className="text-right p-4">{t('sales.quantity')}</th>
                        <th className="text-right p-4">{t('products.price')}</th>
                        <th className="text-right p-4">{t('sales.total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-4">{item.products?.sku || '-'}</td>
                          <td className="p-4">{item.products?.name || '-'}</td>
                          <td className="p-4 text-right">{item.quantity}</td>
                          <td className="p-4 text-right">{formatCurrency(Number(item.price), currency)}</td>
                          <td className="p-4 text-right font-semibold">{formatCurrency(Number(item.total), currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen y cliente */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('sales.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('sales.subtotal')}</span>
                  <span className="font-semibold">{formatCurrency(Number(sale.subtotal), currency)}</span>
                </div>
                {(() => {
                  const taxAmount = Number(sale.tax) || 0
                  const discountAmount = Number(sale.discount) || 0
                  
                  // Si el tax es 0, calcularlo a partir del total y subtotal
                  let calculatedTax = taxAmount
                  if (taxAmount === 0 && sale.total && sale.subtotal) {
                    calculatedTax = Number(sale.total) - Number(sale.subtotal) - discountAmount
                  }
                  
                  // Solo mostrar IVA si es mayor a 0
                  if (calculatedTax > 0) {
                    return (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('sales.tax')} (19%)</span>
                        <span className="font-semibold">{formatCurrency(calculatedTax, currency)}</span>
                      </div>
                    )
                  }
                  return null
                })()}
                {sale.discount && Number(sale.discount) > 0 ? (
                  <div className="flex justify-between text-red-600">
                    <span>{t('sales.discount')}</span>
                    <span className="font-semibold">-{formatCurrency(Number(sale.discount), currency)}</span>
                  </div>
                ) : null}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">{t('sales.total')}</span>
                    <span className="text-lg font-bold">{formatCurrency(Number(sale.total), currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {sale.customers && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('sales.customer')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">{t('customers.name')}</p>
                    <p className="font-semibold">{sale.customers.name}</p>
                  </div>
                  {sale.customers.email && (
                    <div>
                      <p className="text-sm text-gray-500">{t('customers.email')}</p>
                      <p className="font-semibold">{sale.customers.email}</p>
                    </div>
                  )}
                  {sale.customers.phone && (
                    <div>
                      <p className="text-sm text-gray-500">{t('customers.phone')}</p>
                      <p className="font-semibold">{sale.customers.phone}</p>
                    </div>
                  )}
                  {sale.customers.address && (
                    <div>
                      <p className="text-sm text-gray-500">{t('customers.address')}</p>
                      <p className="font-semibold">{sale.customers.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {sale.users && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('sales.seller')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{sale.users.full_name || sale.users.email}</p>
                </CardContent>
              </Card>
            )}

            {sale.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('sales.notes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{sale.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

