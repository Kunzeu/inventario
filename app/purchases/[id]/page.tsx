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

async function getPurchaseDetails(purchaseId: string) {
  const supabase = createServerSupabaseClient()

  // Obtener información de la compra
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select(`
      *,
      suppliers (name, email, phone, address)
    `)
    .eq('id', purchaseId)
    .single()

  if (purchaseError || !purchase) {
    return null
  }

  // Obtener items de la compra
  const { data: purchaseItems } = await supabase
    .from('purchase_items')
    .select(`
      *,
      products (name, sku, price)
    `)
    .eq('purchase_id', purchaseId)
    .order('created_at', { ascending: true })

  return {
    purchase,
    items: purchaseItems || [],
  }
}

export default async function PurchaseDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const purchaseData = await getPurchaseDetails(params.id)
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const t = (key: string) => getTranslation(key, lang)

  if (!purchaseData) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('purchases.purchaseDetails')}</h1>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">{t('purchases.purchaseNotFound')}</p>
              <Link href="/purchases">
                <Button className="mt-4">{t('common.back')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const { purchase, items } = purchaseData

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/purchases">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t('purchases.purchaseDetails')}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la compra */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('purchases.purchaseInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('purchases.purchaseNumber')}</p>
                    <p className="font-semibold">{purchase.purchase_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('purchases.date')}</p>
                    <p className="font-semibold">{formatDate(purchase.created_at, locale)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('purchases.status')}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {purchase.status === 'completed' ? t('sales.completed') : t('sales.pending')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('purchases.items')}</CardTitle>
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
                        <th className="text-right p-4">{t('purchases.total')}</th>
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

          {/* Resumen y proveedor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('purchases.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('purchases.subtotal')}</span>
                  <span className="font-semibold">{formatCurrency(Number(purchase.subtotal), currency)}</span>
                </div>
                {(() => {
                  const taxAmount = Number(purchase.tax) || 0
                  // Solo mostrar IVA si es mayor a 0
                  if (taxAmount > 0) {
                    return (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('purchases.tax')} (19%)</span>
                        <span className="font-semibold">{formatCurrency(taxAmount, currency)}</span>
                      </div>
                    )
                  }
                  return null
                })()}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">{t('purchases.total')}</span>
                    <span className="text-lg font-bold">{formatCurrency(Number(purchase.total), currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {purchase.suppliers && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('purchases.supplier')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">{t('suppliers.name')}</p>
                    <p className="font-semibold">{purchase.suppliers.name}</p>
                  </div>
                  {purchase.suppliers.email && (
                    <div>
                      <p className="text-sm text-gray-500">{t('suppliers.email')}</p>
                      <p className="font-semibold">{purchase.suppliers.email}</p>
                    </div>
                  )}
                  {purchase.suppliers.phone && (
                    <div>
                      <p className="text-sm text-gray-500">{t('suppliers.phone')}</p>
                      <p className="font-semibold">{purchase.suppliers.phone}</p>
                    </div>
                  )}
                  {purchase.suppliers.address && (
                    <div>
                      <p className="text-sm text-gray-500">{t('suppliers.address')}</p>
                      <p className="font-semibold">{purchase.suppliers.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {purchase.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('purchases.notes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{purchase.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

