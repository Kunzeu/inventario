import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { getCompanyCurrency } from '@/lib/get-currency'
import { DeleteProductButton } from '@/components/products/delete-product-button'
import { getUserRole } from '@/lib/get-user-role'
import { hasPermission, type UserRole } from '@/lib/permissions'

async function getProducts() {
  const supabase = createServerSupabaseClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories (name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return products || []
}

export default async function ProductsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const role = await getUserRole()
  if (!role || !hasPermission(role as UserRole, 'canViewProducts')) {
    redirect('/dashboard')
  }

  const products = await getProducts()
  const lang = await getCompanyLanguage()
  const currency = await getCompanyCurrency()
  const t = (key: string) => getTranslation(key, lang)
  const canCreateProducts = role && hasPermission(role as UserRole, 'canCreateProducts')
  const canEditProducts = role && hasPermission(role as UserRole, 'canEditProducts')
  const canDeleteProducts = role && hasPermission(role as UserRole, 'canDeleteProducts')

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('products.title')}</h1>
          {canCreateProducts && (
            <Link href="/products/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('products.addProduct')}
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('products.productList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t('products.sku')}</th>
                    <th className="text-left p-4">{t('products.name')}</th>
                    <th className="text-left p-4">{t('products.category')}</th>
                    <th className="text-left p-4">{t('products.price')}</th>
                    <th className="text-left p-4">{t('products.stock')}</th>
                    <th className="text-left p-4">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-4">{product.sku}</td>
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.categories?.name || '-'}</td>
                      <td className="p-4">{formatCurrency(Number(product.price), currency)}</td>
                      <td className="p-4">
                        <span className={Number(product.stock) <= Number(product.min_stock) ? 'text-red-600 font-bold' : ''}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {canEditProducts && (
                            <Link href={`/products/${product.id}`}>
                              <Button variant="outline" size="sm">{t('common.edit')}</Button>
                            </Link>
                          )}
                          {canDeleteProducts && (
                            <DeleteProductButton productId={product.id} productName={product.name} />
                          )}
                        </div>
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

