import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'

async function getCustomers() {
  const supabase = createServerSupabaseClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return customers || []
}

export default async function CustomersPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const customers = await getCustomers()
  const lang = await getCompanyLanguage()
  const t = (key: string) => getTranslation(key, lang)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('customers.title')}</h1>
          <Link href="/customers/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {t('customers.addCustomer')}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('customers.customerList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t('customers.name')}</th>
                    <th className="text-left p-4">{t('customers.email')}</th>
                    <th className="text-left p-4">{t('customers.phone')}</th>
                    <th className="text-left p-4">{t('customers.loyaltyPoints')}</th>
                    <th className="text-left p-4">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b">
                      <td className="p-4">{customer.name}</td>
                      <td className="p-4">{customer.email || '-'}</td>
                      <td className="p-4">{customer.phone || '-'}</td>
                      <td className="p-4">{customer.loyalty_points || 0}</td>
                      <td className="p-4">
                        <Link href={`/customers/${customer.id}`}>
                          <Button variant="outline" size="sm">{t('customers.viewDetails')}</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-lg">{customer.name}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">{t('customers.email')}: </span>
                          <span>{customer.email || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('customers.phone')}: </span>
                          <span>{customer.phone || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('customers.loyaltyPoints')}: </span>
                          <span className="font-semibold">{customer.loyalty_points || 0}</span>
                        </div>
                      </div>
                      <Link href={`/customers/${customer.id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full">{t('customers.viewDetails')}</Button>
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

