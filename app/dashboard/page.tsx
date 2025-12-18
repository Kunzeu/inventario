import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'

async function getDashboardData() {
  const supabase = createServerSupabaseClient()

  // Obtener ventas de hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todaySales } = await supabase
    .from('sales')
    .select('total')
    .gte('created_at', today.toISOString())

  const todayRevenue = todaySales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0
  const todaySalesCount = todaySales?.length || 0

  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, stock, min_stock')
    .eq('is_active', true)

  // Filtrar productos con bajo stock (stock <= min_stock)
  const lowStockProducts = allProducts?.filter(p => Number(p.stock) <= Number(p.min_stock)) || []
  
  // Contar total de productos activos
  const totalProducts = allProducts?.length || 0

  return {
    todayRevenue,
    todaySalesCount,
    lowStockCount: lowStockProducts.length,
    totalProducts,
  }
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const t = (key: string) => getTranslation(key, lang)

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('email, full_name, role')
    .eq('id', session.user.id)
    .single()

  if (userError) {
    console.error('Error al obtener usuario:', userError)
    const isRLSError = userError.code === 'PGRST301' || userError.message.includes('permission denied') || userError.message.includes('row-level security')
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-2xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-red-600">{t('errors.loadUserError')}</h1>
          <p className="text-gray-600">{t('errors.couldNotLoadUser')}</p>
          
          {isRLSError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 text-left">
              <h2 className="font-semibold text-yellow-800 mb-2">⚠️ {t('errors.rlsError')}</h2>
              <p className="text-sm text-yellow-700 mb-3">
                {t('errors.rlsMessage')}
              </p>
              <p className="text-sm text-yellow-700 font-semibold mb-2">{t('errors.solution')}</p>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Ve a tu proyecto en Supabase</li>
                <li>Abre el <strong>SQL Editor</strong></li>
                <li>Copia y ejecuta el contenido del archivo <code className="bg-yellow-100 px-1 rounded">supabase/schema-single-company.sql</code></li>
                <li>Recarga esta página</li>
              </ol>
            </div>
          )}
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 text-left">
            <p className="text-sm text-gray-600 font-semibold mb-1">{t('errors.errorDetails')}</p>
            <p className="text-xs text-gray-500 font-mono">{t('errors.code')}: {userError.code || 'N/A'}</p>
            <p className="text-xs text-gray-500 font-mono">{t('errors.message')}: {userError.message}</p>
            <p className="text-xs text-gray-500 font-mono mt-2">{t('errors.userId')}: {session.user.id}</p>
            <p className="text-xs text-gray-500 font-mono">{t('common.email')}: {session.user.email}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-yellow-600">{t('errors.userNotFound')}</h1>
          <p className="text-gray-600">{t('errors.userNotRegistered')}</p>
          <p className="text-sm text-gray-500">{t('errors.userId')}: {session.user.id}</p>
          <p className="text-sm text-gray-500">{t('common.email')}: {session.user.email}</p>
          <p className="text-sm text-gray-500 mt-4">
            Ejecuta el script create-admin para crear tu usuario en la base de datos.
          </p>
        </div>
      </div>
    )
  }

  const dashboardData = await getDashboardData()

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.todayRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData.todayRevenue, currency)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.todaySales')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.todaySalesCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.lowStock')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.lowStockCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalProducts')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalProducts}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

