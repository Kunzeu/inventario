'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface DeleteStaffButtonProps {
  staffId: string
  staffName: string
}

export function DeleteStaffButton({ staffId, staffName }: DeleteStaffButtonProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('staff.confirmDeleteDescription', { name: staffName }))) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false }) // Soft delete
        .eq('id', staffId)

      if (error) throw error

      toast.success(t('staff.employeeDeleted'))
      router.push('/staff')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || t('staff.errorDeleting'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {t('common.delete')}
    </Button>
  )
}

