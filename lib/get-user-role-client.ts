'use client'

import { createSupabaseClient } from './supabase/client'
import { useState, useEffect } from 'react'

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function fetchRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          setRole(null)
          setLoading(false)
          return
        }

        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        setRole(user?.role || null)
      } catch (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [])

  return { role, loading }
}

export async function getUserRoleClient(): Promise<string | null> {
  const supabase = createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  return user?.role || null
}

