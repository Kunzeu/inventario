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
import { DeleteSupplierButton } from '@/components/suppliers/delete-supplier-button'

async function getSupplierDetails(supplierId: string) {
  const supabase = createServerSupabaseClient()

  // Obtener información del proveedor
  const { data: supplier, error: supplierError } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .single()

  if (supplierError || !supplier) {
    return null
  }

  // Obtener compras del proveedor
  const { data: purchases } = await supabase
    .from('purchases')
    .select('id, purchase_number, total, created_at, status')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    supplier,
    purchases: purchases || [],
  }
}

export default async function SupplierDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const supplierData = await getSupplierDetails(params.id)
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const t = (key: string) => getTranslation(key, lang)

  if (!supplierData) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('suppliers.supplierDetails')}</h1>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">{t('suppliers.supplierNotFound')}</p>
              <Link href="/suppliers">
                <Button className="mt-4">{t('common.back')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const { supplier, purchases } = supplierData

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/suppliers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t('suppliers.supplierDetails')}</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/suppliers/${params.id}/edit`}>
              <Button>{t('common.edit')}</Button>
            </Link>
            <DeleteSupplierButton supplierId={params.id} supplierName={supplier.name} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del proveedor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('suppliers.supplierInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('suppliers.name')}</p>
                    <p className="font-semibold">{supplier.name}</p>
                  </div>
                  {supplier.tax_id && (
                    <div>
                      <p className="text-sm text-gray-500">{t('suppliers.taxId')}</p>
                      <p className="font-semibold">{supplier.tax_id}</p>
                    </div>
                  )}
                  {supplier.contact_name && (
                    <div>
                      <p className="text-sm text-gray-500">{t('suppliers.contact')}</p>
                      <p className="font-semibold">{supplier.contact_name}</p>
                    </div>
                  )}
                  {supplier.email && (
                    <div>
                      <p className="text-sm text-gray-500">{t('common.email')}</p>
                      <p className="font-semibold">{supplier.email}</p>
                    </div>
                  )}
                  {supplier.phone && (
                    <div>
                      <p className="text-sm text-gray-500">{t('common.phone')}</p>
                      <p className="font-semibold">{supplier.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">{t('suppliers.status')}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.is_active ? t('staff.active') : t('staff.inactive')}
                    </span>
                  </div>
                </div>
                {supplier.address && (
                  <div>
                    <p className="text-sm text-gray-500">{t('suppliers.address')}</p>
                    <p className="font-semibold">{supplier.address}</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">{t('suppliers.createdAt')}</p>
                  <p className="font-semibold">{formatDate(supplier.created_at)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('suppliers.recentPurchases')}</CardTitle>
              </CardHeader>
              <CardContent>
                {purchases.length > 0 ? (
                  <div className="space-y-2">
                    {purchases.map((purchase: any) => (
                      <Link key={purchase.id} href={`/purchases/${purchase.id}`}>
                        <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <p className="font-medium">{purchase.purchase_number}</p>
                            <p className="text-sm text-gray-500">{formatDate(purchase.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {purchase.status === 'completed' ? t('sales.completed') : t('sales.pending')}
                            </span>
                            <p className="font-bold">{formatCurrency(Number(purchase.total), currency)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t('suppliers.noPurchases')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('suppliers.statistics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('suppliers.totalPurchases')}</span>
                  <span className="font-semibold">{purchases.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('suppliers.totalSpent')}</span>
                  <span className="font-semibold">
                    {formatCurrency(purchases.reduce((sum, p) => sum + Number(p.total), 0), currency)}
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

