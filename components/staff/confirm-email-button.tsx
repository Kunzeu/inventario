'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface ConfirmEmailButtonProps {
  userId: string
  email: string
  onConfirmed?: () => void
}

export function ConfirmEmailButton({ userId, email, onConfirmed }: ConfirmEmailButtonProps) {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    checkEmailStatus()
  }, [userId])

  const checkEmailStatus = async () => {
    setChecking(true)
    try {
      const response = await fetch('/api/staff/check-email-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsConfirmed(data.emailConfirmed)
      }
    } catch (error) {
      console.error('Error checking email status:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleConfirm = async () => {
    if (!confirm(t('staff.confirmEmailConfirm', { email }))) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/staff/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('staff.errorConfirmingEmail'))
      }

      setIsConfirmed(true)
      toast.success(t('staff.emailConfirmed'))
      if (onConfirmed) {
        onConfirmed()
      }
    } catch (error: any) {
      toast.error(error.message || t('staff.errorConfirmingEmail'))
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return <span className="text-xs text-gray-500">{t('common.loading')}</span>
  }

  if (isConfirmed) {
    return (
      <span className="text-xs text-green-600 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        {t('staff.emailConfirmed')}
      </span>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleConfirm}
      disabled={loading}
      className="text-xs"
    >
      <Mail className="w-3 h-3 mr-1" />
      {loading ? t('common.loading') : t('staff.confirmEmail')}
    </Button>
  )
}

