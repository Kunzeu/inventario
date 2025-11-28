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

export default function EditStaffPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useTranslation()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'employee',
    is_active: true,
  })

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          email: data.email,
          role: data.role,
          is_active: data.is_active,
        })
      }
    } catch (error: any) {
      toast.error(error.message || t('staff.errorLoading'))
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name || null,
          role: formData.role,
          is_active: formData.is_active,
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success(t('staff.employeeUpdated'))
      router.push('/staff')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || t('staff.error'))
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
        <h1 className="text-3xl font-bold text-gray-900">{t('staff.editEmployee')}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('staff.employeeInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('staff.name')} *</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  placeholder={t('staff.name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('staff.email')}</label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                  placeholder={t('staff.email')}
                />
                <p className="text-xs text-gray-500 mt-1">{t('staff.emailCannotChange')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('staff.role')} *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="admin">{t('staff.roles.admin')}</option>
                  <option value="manager">{t('staff.roles.manager')}</option>
                  <option value="employee">{t('staff.roles.employee')}</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">{t('staff.active')}</span>
                </label>
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

