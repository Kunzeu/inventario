import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, ShoppingBag, DollarSign, Award } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'
import { getLocaleFromCurrency } from '@/lib/currency-locale'
import { DeleteCustomerButton } from '@/components/customers/delete-customer-button'

async function getCustomer(id: string) {
  const supabase = createServerSupabaseClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  return customer
}

async function getCustomerSales(customerId: string) {
  const supabase = createServerSupabaseClient()

  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (
        quantity,
        price,
        total,
        products (name, sku)
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(10)

  return sales || []
}

async function getCustomerStats(customerId: string) {
  const supabase = createServerSupabaseClient()

  const { data: sales } = await supabase
    .from('sales')
    .select('total')
    .eq('customer_id', customerId)

  const totalSales = sales?.length || 0
  const totalSpent = sales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0

  return {
    totalSales,
    totalSpent,
  }
}

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const customer = await getCustomer(params.id)
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const t = (key: string) => getTranslation(key, lang)

  if (!customer) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('customers.customerNotFound')}</h1>
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

  const sales = await getCustomerSales(params.id)
  const stats = await getCustomerStats(params.id)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('customers.customerDetails')}</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/customers/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                {t('common.edit')}
              </Button>
            </Link>
            <DeleteCustomerButton customerId={params.id} customerName={customer.name} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Cliente */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('customers.customerInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('customers.name')}</label>
                    <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                  </div>
                  {customer.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('customers.email')}</label>
                      <p className="text-lg text-gray-900">{customer.email}</p>
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('customers.phone')}</label>
                      <p className="text-lg text-gray-900">{customer.phone}</p>
                    </div>
                  )}
                  {customer.tax_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('customers.taxId')}</label>
                      <p className="text-lg text-gray-900">{customer.tax_id}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-500">{t('customers.address')}</label>
                      <p className="text-lg text-gray-900">{customer.address}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('customers.createdAt')}</label>
                    <p className="text-lg text-gray-900">{formatDate(customer.created_at, locale)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('customers.status')}</label>
                    <p className="text-lg">
                      <span className={`px-2 py-1 rounded text-xs ${
                        customer.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.is_active ? t('staff.active') : t('staff.inactive')}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ventas Recientes */}
            <Card>
              <CardHeader>
                <CardTitle>{t('customers.recentSales')}</CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">{t('customers.noSales')}</p>
                ) : (
                  <div className="space-y-4">
                    {sales.map((sale: any) => (
                      <div key={sale.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link href={`/sales/${sale.id}`} className="font-semibold text-blue-600 hover:underline">
                              {sale.sale_number}
                            </Link>
                            <p className="text-sm text-gray-500">{formatDate(sale.created_at, locale)}</p>
                          </div>
                          <span className="font-bold text-lg">{formatCurrency(Number(sale.total), currency)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="mr-4">
                            {t('sales.paymentMethod')}: {
                              sale.payment_method === 'cash' ? t('pos.cash') :
                              sale.payment_method === 'card' ? t('pos.card') :
                              sale.payment_method === 'transfer' ? t('pos.transfer') :
                              sale.payment_method
                            }
                          </span>
                          <span>
                            {t('sales.items')}: {sale.sale_items?.length || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('customers.statistics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('customers.totalSales')}</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('customers.totalSpent')}</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent, currency)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('customers.loyaltyPoints')}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {customer.loyalty_points || 0} {t('customers.points')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

