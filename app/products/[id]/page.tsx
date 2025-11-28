'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { DeleteProductButton } from '@/components/products/delete-product-button'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useTranslation()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '0',
    barcode: '',
  })

  useEffect(() => {
    loadProduct()
    loadCategories()
  }, [params.id])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true })

    if (data) {
      setCategories(data)
    }
  }

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          sku: data.sku || '',
          name: data.name || '',
          description: data.description || '',
          category_id: data.category_id || '',
          price: data.price?.toString() || '',
          cost: data.cost?.toString() || '',
          stock: data.stock?.toString() || '',
          min_stock: data.min_stock?.toString() || '0',
          barcode: data.barcode || '',
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar el producto')
      router.push('/products')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión')

      const { error } = await supabase
        .from('products')
        .update({
          sku: formData.sku,
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          price: parseFloat(formData.price),
          cost: formData.cost ? parseFloat(formData.cost) : null,
          stock: parseFloat(formData.stock) || 0,
          min_stock: parseFloat(formData.min_stock) || 0,
          barcode: formData.barcode || null,
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success('Producto actualizado exitosamente')
      router.push('/products')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el producto')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('common.loading')}</h1>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('common.edit')} {t('products.title')}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('products.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('products.sku')} *</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  placeholder="SKU-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('products.name')} *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t('products.name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('products.category')}</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">{t('products.category')} ({t('common.noData')})</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Descripción del producto"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('products.price')} *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Costo</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('products.stock')}</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                  <Input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código de Barras</label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.loading') : t('common.save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  {t('common.cancel')}
                </Button>
                <DeleteProductButton productId={params.id as string} productName={formData.name} />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

