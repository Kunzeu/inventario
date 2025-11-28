'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter()
  const { t } = useTranslation()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('products.confirmDelete', { name: productName }))) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)

      if (error) throw error

      toast.success(t('products.productDeleted'))
      router.push('/products')
    } catch (error: any) {
      toast.error(error.message || t('products.errorDeleting'))
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

