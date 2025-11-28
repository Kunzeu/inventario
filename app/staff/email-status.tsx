'use client'

import { ConfirmEmailButton } from '@/components/staff/confirm-email-button'
import { useUserRole } from '@/lib/get-user-role-client'

interface EmailStatusProps {
  userId: string
  email: string
}

export function EmailStatus({ userId, email }: EmailStatusProps) {
  const { role } = useUserRole()
  const isAdmin = role === 'admin'

  return (
    <ConfirmEmailButton 
      userId={userId} 
      email={email}
      isAdmin={isAdmin}
    />
  )
}

