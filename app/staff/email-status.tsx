'use client'

import { ConfirmEmailButton } from '@/components/staff/confirm-email-button'

interface EmailStatusProps {
  userId: string
  email: string
}

export function EmailStatus({ userId, email }: EmailStatusProps) {
  return (
    <ConfirmEmailButton 
      userId={userId} 
      email={email}
    />
  )
}

