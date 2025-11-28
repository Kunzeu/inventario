import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'
import { getLocaleFromCurrency } from '@/lib/currency-locale'
import { SalesChart } from '@/components/reports/sales-chart'
import { MonthlySalesChart } from '@/components/reports/monthly-sales-chart'
import { TopProductsChart } from '@/components/reports/top-products-chart'
import { PaymentMethodsChart } from '@/components/reports/payment-methods-chart'

async function getReportsData(locale: string) {
  const supabase = createServerSupabaseClient()

  // Ventas por día (últimos 7 días)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: sales } = await supabase
    .from('sales')
    .select('total, created_at, payment_method, subtotal, tax')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Agrupar por día
  const salesByDay: { [key: string]: number } = {}
  sales?.forEach(sale => {
    const date = new Date(sale.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    salesByDay[date] = (salesByDay[date] || 0) + Number(sale.total)
  })

  const chartData = Object.entries(salesByDay).map(([date, total]) => ({
    date,
    total: Number(total.toFixed(2))
  }))

  // Top productos vendidos - obtener items de ventas de los últimos 7 días
  const { data: salesWithItems } = await supabase
    .from('sales')
    .select(`
      id,
      sale_items (
        quantity,
        products (name, sku)
      )
    `)
    .gte('created_at', sevenDaysAgo.toISOString())

  // Extraer todos los items de venta
  const topProducts: any[] = []
  salesWithItems?.forEach((sale: any) => {
    if (sale.sale_items) {
      topProducts.push(...sale.sale_items)
    }
  })

  // Agrupar productos
  const productSales: { [key: string]: { name: string; quantity: number } } = {}
  topProducts?.forEach((item: any) => {
    const productName = item.products?.name || 'Desconocido'
    productSales[productName] = {
      name: productName,
      quantity: (productSales[productName]?.quantity || 0) + Number(item.quantity)
    }
  })

  const topProductsData = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Estadísticas generales
  const totalSales = sales?.length || 0
  const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0
  const totalTax = sales?.reduce((sum, sale) => sum + Number(sale.tax || 0), 0) || 0

  // Métodos de pago
  const paymentMethods: { [key: string]: number } = {}
  sales?.forEach(sale => {
    const method = sale.payment_method || 'unknown'
    paymentMethods[method] = (paymentMethods[method] || 0) + Number(sale.total)
  })

  const paymentData = Object.entries(paymentMethods).map(([name, value]) => ({
    name: name === 'cash' ? 'Efectivo' : name === 'card' ? 'Tarjeta' : name === 'transfer' ? 'Transferencia' : name,
    value: Number(value.toFixed(2))
  }))

  // Ventas por mes (últimos 6 meses)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: monthlySales } = await supabase
    .from('sales')
    .select('total, created_at')
    .gte('created_at', sixMonthsAgo.toISOString())

  const salesByMonth: { [key: string]: number } = {}
  monthlySales?.forEach(sale => {
    const date = new Date(sale.created_at)
    const monthKey = date.toLocaleDateString(locale, { month: 'short', year: 'numeric' })
    salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + Number(sale.total)
  })

  const monthlyChartData = Object.entries(salesByMonth).map(([month, total]) => ({
    month,
    total: Number(total.toFixed(2))
  }))

  // Compras (últimos 30 días)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: purchases } = await supabase
    .from('purchases')
    .select('total')
    .gte('created_at', thirtyDaysAgo.toISOString())

  const totalPurchases = purchases?.length || 0
  const totalPurchaseAmount = purchases?.reduce((sum, p) => sum + Number(p.total), 0) || 0

  // Clientes activos
  const { data: customers } = await supabase
    .from('customers')
    .select('id')
    .eq('is_active', true)

  const totalCustomers = customers?.length || 0

  // Productos activos
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true)

  const totalProducts = products?.length || 0

  return {
    chartData,
    topProductsData,
    paymentData,
    monthlyChartData,
    stats: {
      totalSales,
      totalRevenue,
      averageSale,
      totalTax,
      totalPurchases,
      totalPurchaseAmount,
      totalCustomers,
      totalProducts,
    }
  }
}

export default async function ReportsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const locale = getLocaleFromCurrency(currency)
  const reportsData = await getReportsData(locale)
  const t = (key: string) => getTranslation(key, lang)

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportsData.stats.totalRevenue, currency)}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('reports.last7Days')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalSales')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportsData.stats.totalSales}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('reports.average')}: {formatCurrency(reportsData.stats.averageSale, currency)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalPurchases')}</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportsData.stats.totalPurchases}</div>
              <p className="text-xs text-muted-foreground mt-1">{formatCurrency(reportsData.stats.totalPurchaseAmount, currency)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalCustomers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportsData.stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('reports.activeCustomers')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.salesByDay')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={reportsData.chartData} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.salesByMonth')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlySalesChart data={reportsData.monthlyChartData} currency={currency} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.topProducts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TopProductsChart data={reportsData.topProductsData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.paymentMethods')}</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodsChart data={reportsData.paymentData} currency={currency} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

