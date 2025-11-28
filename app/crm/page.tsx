import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'
import { getLocaleFromCurrency } from '@/lib/currency-locale'
import { CRMSearch } from '@/components/crm/crm-search'

async function getCRMData() {
  const supabase = createServerSupabaseClient()

  // Obtener clientes con sus ventas
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      sales (id, total, created_at)
    `)
    .eq('is_active', true)

  // Calcular estadísticas por cliente
  const customersWithStats = customers?.map(customer => {
    const sales = customer.sales || []
    const totalSpent = sales.reduce((sum: number, sale: any) => sum + Number(sale.total), 0)
    const lastPurchase = sales.length > 0 
      ? new Date(Math.max(...sales.map((s: any) => new Date(s.created_at).getTime())))
      : null

    return {
      ...customer,
      totalSpent,
      purchaseCount: sales.length,
      lastPurchase,
    }
  }).sort((a, b) => b.totalSpent - a.totalSpent) || []

  return {
    customers: customersWithStats,
  }
}

export default async function CRMPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const crmData = await getCRMData()
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const t = (key: string) => getTranslation(key, lang)

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('crm.title')}</h1>

        <CRMSearch 
          customers={crmData.customers} 
          currency={currency}
          locale={locale}
        />
      </div>
    </MainLayout>
  )
}

