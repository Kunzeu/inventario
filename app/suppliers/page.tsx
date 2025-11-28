import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'

async function getSuppliers() {
  const supabase = createServerSupabaseClient()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return suppliers || []
}

export default async function SuppliersPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const suppliers = await getSuppliers()
  const lang = await getCompanyLanguage()
  const t = (key: string) => getTranslation(key, lang)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('suppliers.title')}</h1>
          <Link href="/suppliers/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {t('suppliers.addSupplier')}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('suppliers.supplierList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="p-4 border rounded-lg">
                  <h3 className="font-bold text-lg">{supplier.name}</h3>
                  {supplier.contact_name && (
                    <p className="text-sm text-gray-600">{t('suppliers.contact')}: {supplier.contact_name}</p>
                  )}
                  {supplier.email && (
                    <p className="text-sm text-gray-600">{t('common.email')}: {supplier.email}</p>
                  )}
                  {supplier.phone && (
                    <p className="text-sm text-gray-600">{t('common.phone')}: {supplier.phone}</p>
                  )}
                  {supplier.tax_id && (
                    <p className="text-sm text-gray-600">{t('suppliers.taxId')}: {supplier.tax_id}</p>
                  )}
                  <div className="mt-4">
                    <Link href={`/suppliers/${supplier.id}`}>
                      <Button variant="outline" size="sm">{t('suppliers.viewDetails')}</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

