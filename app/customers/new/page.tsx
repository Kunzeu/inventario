'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function NewCustomerPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar email si se proporciona
      if (formData.email && formData.email.trim().length > 0) {
        if (formData.email.length < 5) {
          toast.error(t('validation.emailMinLength'))
          setLoading(false)
          return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          toast.error(t('validation.emailInvalid'))
          setLoading(false)
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión')

      const { error } = await supabase
        .from('customers')
        .insert({
          name: formData.name,
          email: formData.email && formData.email.trim().length >= 5 ? formData.email.trim() : null,
          phone: formData.phone || null,
          address: formData.address || null,
          tax_id: formData.tax_id || null,
          loyalty_points: 0,
          is_active: true,
        })

      if (error) throw error

      toast.success(t('customers.customerAdded'))
      router.push('/customers')
    } catch (error: any) {
      toast.error(error.message || t('customers.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('customers.addCustomer')}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('customers.customerInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('customers.name')} *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t('customers.name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('common.email')}</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  minLength={5}
                  placeholder={t('common.email')}
                />
                {formData.email && formData.email.length > 0 && formData.email.length < 5 && (
                  <p className="text-xs text-red-500 mt-1">{t('validation.emailMinLength')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('common.phone')}</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('common.phone')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('customers.taxId')}</label>
                <Input
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder={t('customers.taxId')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('customers.address')}</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder={t('customers.address')}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.loading') : t('common.save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

