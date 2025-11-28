'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/get-user-role-client'
import { hasPermission, type UserRole } from '@/lib/permissions'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'

interface RequirePermissionProps {
  permission: keyof import('@/lib/permissions').Permissions
  children: React.ReactNode
}

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { role, loading } = useUserRole()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (!loading && role) {
      if (!hasPermission(role as UserRole, permission)) {
        router.push('/dashboard')
      }
    }
  }, [role, loading, permission, router])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!role || !hasPermission(role as UserRole, permission)) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <CardTitle>{t('auth.accessDenied')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('auth.insufficientPermissions')}</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return <>{children}</>
}

