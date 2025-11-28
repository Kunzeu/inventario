'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'

interface ConfirmEmailButtonProps {
  userId: string
  userEmail: string
  isAdmin?: boolean
}

export function ConfirmEmailButton({ userId, userEmail, isAdmin = false }: ConfirmEmailButtonProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const checkEmailStatus = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/staff/check-email-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        const data = await response.json()
        if (response.ok) {
          setIsConfirmed(data.isConfirmed)
        } else {
          throw new Error(data.error || 'Error checking email status')
        }
      } catch (error: any) {
        console.error('Failed to check email status:', error)
        toast.error(error.message || t('staff.errorCheckingEmailStatus'))
        setIsConfirmed(false)
      } finally {
        setLoading(false)
      }
    }
    checkEmailStatus()
  }, [userId, t])

  const handleConfirmEmail = async () => {
    setConfirming(true)
    try {
      const response = await fetch('/api/staff/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(t('staff.emailConfirmedSuccessfully'))
        setIsConfirmed(true)
        router.refresh()
      } else {
        throw new Error(data.error || 'Error confirming email')
      }
    } catch (error: any) {
      toast.error(error.message || t('staff.errorConfirmingEmail'))
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
  }

  return (
    <div className="flex items-center space-x-2">
      {isConfirmed ? (
        <span className="flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          {t('staff.emailConfirmed')}
        </span>
      ) : (
        <span className="flex items-center text-red-600 text-sm">
          <XCircle className="w-4 h-4 mr-1" />
          {t('staff.emailNotConfirmed')}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfirmEmail}
              disabled={confirming}
              className="ml-2 text-xs h-auto py-1"
            >
              {confirming ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {t('staff.confirmEmail')}
            </Button>
          )}
        </span>
      )}
    </div>
  )
}

