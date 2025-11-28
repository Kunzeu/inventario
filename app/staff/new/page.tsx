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

export default function NewStaffPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'employee',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar email
      if (!formData.email || formData.email.trim().length < 5) {
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

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión')

      // Crear usuario usando API route (confirma email automáticamente)
      const response = await fetch('/api/staff/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario')
      }

      toast.success(t('staff.employeeAdded'))
      router.push('/staff')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || t('staff.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('staff.addEmployee')}</h1>

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
                <label className="block text-sm font-medium mb-1">{t('staff.email')} *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  minLength={5}
                  placeholder={t('staff.email')}
                />
                <p className="text-xs text-gray-500 mt-1">{t('validation.emailMinLengthHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('staff.password')} *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder={t('staff.password')}
                />
                <p className="text-xs text-gray-500 mt-1">{t('staff.passwordHint')}</p>
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

