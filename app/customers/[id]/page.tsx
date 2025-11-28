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
import { DeleteCustomerButton } from '@/components/customers/delete-customer-button'

async function getCustomerDetails(customerId: string) {
  const supabase = createServerSupabaseClient()

  // Obtener información del cliente
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (customerError || !customer) {
    return null
  }

  // Obtener ventas del cliente
  const { data: sales } = await supabase
    .from('sales')
    .select('id, sale_number, total, created_at, status')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    customer,
    sales: sales || [],
  }
}

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const customerData = await getCustomerDetails(params.id)
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const t = (key: string) => getTranslation(key, lang)

  if (!customerData) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('customers.customerNotFound')}</h1>
          <Link href="/customers">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const { customer, sales } = customerData

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/customers">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/customers/${customer.id}/edit`}>
              <Button size="sm">{t('common.edit')}</Button>
            </Link>
            <DeleteCustomerButton customerId={customer.id} customerName={customer.name} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{t('customers.customerDetails')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Cliente */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('customers.customerInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('customers.name')}</p>
                    <p className="font-semibold">{customer.name}</p>
                  </div>
                  {customer.email && (
                    <div>
                      <p className="text-sm text-gray-500">{t('customers.email')}</p>
                      <p className="font-semibold">{customer.email}</p>
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <p className="text-sm text-gray-500">{t('customers.phone')}</p>
                      <p className="font-semibold">{customer.phone}</p>
                    </div>
                  )}
                  {customer.tax_id && (
                    <div>
                      <p className="text-sm text-gray-500">{t('customers.taxId')}</p>
                      <p className="font-semibold">{customer.tax_id}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">{t('customers.loyaltyPoints')}</p>
                    <p className="font-semibold">{customer.loyalty_points || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('customers.status')}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      customer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.is_active ? t('staff.active') : t('staff.inactive')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('customers.createdAt')}</p>
                    <p className="font-semibold">{formatDate(customer.created_at, locale)}</p>
                  </div>
                </div>
                {customer.address && (
                  <div>
                    <p className="text-sm text-gray-500">{t('customers.address')}</p>
                    <p className="font-semibold">{customer.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ventas Recientes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('customers.recentSales')}</CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{t('customers.noSales')}</p>
                ) : (
                  <div className="space-y-3">
                    {sales.map((sale: any) => (
                      <div key={sale.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{sale.sale_number}</p>
                          <p className="text-sm text-gray-500">{formatDate(sale.created_at, locale)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(Number(sale.total), currency)}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {sale.status === 'completed' ? t('sales.completed') : t('sales.pending')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>{t('customers.statistics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('customers.totalSales')}</span>
                  <span className="font-semibold">{sales.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('customers.totalSpent')}</span>
                  <span className="font-semibold">
                    {formatCurrency(sales.reduce((sum, s) => sum + Number(s.total), 0), currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

