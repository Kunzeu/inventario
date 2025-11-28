import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'
import { getLocaleFromCurrency } from '@/lib/currency-locale'

async function getPurchases() {
  const supabase = createServerSupabaseClient()

  const { data: purchases } = await supabase
    .from('purchases')
    .select(`
      *,
      suppliers (name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return purchases || []
}

export default async function PurchasesPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const purchases = await getPurchases()
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const t = (key: string) => getTranslation(key, lang)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('purchases.title')}</h1>
          <Link href="/purchases/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {t('purchases.newPurchase')}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('purchases.purchaseHistory')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t('purchases.purchaseNumber')}</th>
                    <th className="text-left p-4">{t('purchases.supplier')}</th>
                    <th className="text-left p-4">{t('purchases.date')}</th>
                    <th className="text-left p-4">{t('purchases.subtotal')}</th>
                    <th className="text-left p-4">{t('purchases.tax')}</th>
                    <th className="text-left p-4">{t('purchases.total')}</th>
                    <th className="text-left p-4">{t('purchases.status')}</th>
                    <th className="text-left p-4">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase: any) => (
                    <tr key={purchase.id} className="border-b">
                      <td className="p-4">{purchase.purchase_number}</td>
                      <td className="p-4">{purchase.suppliers?.name || '-'}</td>
                      <td className="p-4">{formatDate(purchase.created_at, locale)}</td>
                      <td className="p-4">{formatCurrency(Number(purchase.subtotal), currency)}</td>
                      <td className="p-4">{formatCurrency(Number(purchase.tax), currency)}</td>
                      <td className="p-4 font-bold">{formatCurrency(Number(purchase.total), currency)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {purchase.status === 'completed' ? t('sales.completed') : t('sales.pending')}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link href={`/purchases/${purchase.id}`}>
                          <Button variant="outline" size="sm">{t('purchases.viewDetails')}</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {purchases.map((purchase: any) => (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{purchase.purchase_number}</p>
                          <p className="text-sm text-gray-500">{formatDate(purchase.created_at, locale)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {purchase.status === 'completed' ? t('sales.completed') : t('sales.pending')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">{t('purchases.supplier')}: </span>
                          <span>{purchase.suppliers?.name || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('purchases.subtotal')}: </span>
                          <span>{formatCurrency(Number(purchase.subtotal), currency)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('purchases.tax')}: </span>
                          <span>{formatCurrency(Number(purchase.tax), currency)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('purchases.total')}: </span>
                          <span className="font-bold">{formatCurrency(Number(purchase.total), currency)}</span>
                        </div>
                      </div>
                      <Link href={`/purchases/${purchase.id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full">{t('purchases.viewDetails')}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

