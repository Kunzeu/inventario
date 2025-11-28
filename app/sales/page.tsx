import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'
import { getLocaleFromCurrency } from '@/lib/currency-locale'

async function getSales() {
  const supabase = createServerSupabaseClient()

  // Obtener ventas con clientes
  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      customers (name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!sales) return []

  // Obtener IDs únicos de usuarios
  const userIds = Array.from(new Set(sales.map(sale => sale.user_id).filter(Boolean)))
  
  // Obtener información de usuarios
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', userIds)

  // Crear un mapa de usuarios por ID
  const usersMap = new Map(users?.map(u => [u.id, u]) || [])

  // Combinar datos
  return sales.map(sale => ({
    ...sale,
    users: sale.user_id ? usersMap.get(sale.user_id) : null
  }))
}

export default async function SalesPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const sales = await getSales()
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const t = (key: string) => getTranslation(key, lang)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('sales.title')}</h1>
          <Link href="/pos">
            <Button>{t('sales.newSale')}</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('sales.saleHistory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t('sales.saleNumber')}</th>
                    <th className="text-left p-4">{t('sales.customer')}</th>
                    <th className="text-left p-4">{t('sales.seller')}</th>
                    <th className="text-left p-4">{t('sales.date')}</th>
                    <th className="text-left p-4">{t('sales.paymentMethod')}</th>
                    <th className="text-left p-4">{t('sales.total')}</th>
                    <th className="text-left p-4">{t('sales.status')}</th>
                    <th className="text-left p-4">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale: any) => (
                    <tr key={sale.id} className="border-b">
                      <td className="p-4">{sale.sale_number}</td>
                      <td className="p-4">{sale.customers?.name || t('sales.generalCustomer')}</td>
                      <td className="p-4">{sale.users?.full_name || '-'}</td>
                      <td className="p-4">{formatDate(sale.created_at, locale)}</td>
                      <td className="p-4">
                        {sale.payment_method === 'cash' ? t('pos.cash') :
                         sale.payment_method === 'card' ? t('pos.card') :
                         sale.payment_method === 'transfer' ? t('pos.transfer') :
                         sale.payment_method}
                      </td>
                      <td className="p-4 font-bold">{formatCurrency(Number(sale.total), currency)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sale.status === 'completed' ? t('sales.completed') : t('sales.pending')}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link href={`/sales/${sale.id}`}>
                          <Button variant="outline" size="sm">{t('sales.viewDetails')}</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

