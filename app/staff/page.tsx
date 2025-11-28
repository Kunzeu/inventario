import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTranslation } from '@/lib/i18n-server'
import { getCompanyLanguage } from '@/lib/get-language'
import { DeleteStaffButton } from '@/components/staff/delete-staff-button'
import { getUserRole } from '@/lib/get-user-role'
import { hasPermission, type UserRole } from '@/lib/permissions'
import { EmailStatus } from './email-status'

async function getStaff() {
  const supabase = createServerSupabaseClient()

  const { data: staff } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return staff || []
}

export default async function StaffPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const role = await getUserRole()
  if (!role || !hasPermission(role as UserRole, 'canViewStaff')) {
    redirect('/dashboard')
  }

  const staff = await getStaff()
  const lang = await getCompanyLanguage()
  const t = (key: string) => getTranslation(key, lang)
  const canCreateStaff = role && hasPermission(role as UserRole, 'canCreateStaff')

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('staff.title')}</h1>
          {canCreateStaff && (
            <Link href="/staff/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                {t('staff.addEmployee')}
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('staff.employeeList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t('staff.name')}</th>
                    <th className="text-left p-4">{t('staff.email')}</th>
                    <th className="text-left p-4">{t('staff.role')}</th>
                    <th className="text-left p-4">{t('staff.status')}</th>
                    <th className="text-left p-4">{t('staff.emailStatus')}</th>
                    <th className="text-left p-4">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-b">
                      <td className="p-4">{member.full_name || '-'}</td>
                      <td className="p-4">{member.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          member.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.is_active ? t('staff.active') : t('staff.inactive')}
                        </span>
                      </td>
                      <td className="p-4">
                        <EmailStatus userId={member.id} email={member.email} />
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Link href={`/staff/${member.id}/edit`}>
                            <Button variant="outline" size="sm">{t('common.edit')}</Button>
                          </Link>
                          <DeleteStaffButton 
                            staffId={member.id} 
                            staffName={member.full_name || member.email}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {staff.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-lg">{member.full_name || '-'}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {member.role}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          member.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.is_active ? t('staff.active') : t('staff.inactive')}
                        </span>
                      </div>
                      <div>
                        <EmailStatus userId={member.id} email={member.email} />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link href={`/staff/${member.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">{t('common.edit')}</Button>
                        </Link>
                        <div className="flex-1">
                          <DeleteStaffButton 
                            staffId={member.id} 
                            staffName={member.full_name || member.email}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

