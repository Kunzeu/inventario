'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  DollarSign,
  ShoppingBag,
  Truck,
  Users,
  FileText,
  MessageSquare,
  UserCog,
  Settings,
  Store,
  LogOut,
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUserRole } from '@/lib/get-user-role-client'
import { getPermissions, type UserRole } from '@/lib/permissions'

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard', permission: 'canViewDashboard' as const },
  { href: '/pos', icon: ShoppingCart, label: 'nav.pos', permission: 'canUsePOS' as const },
  { href: '/products', icon: Package, label: 'nav.products', permission: 'canViewProducts' as const },
  { href: '/inventory', icon: Warehouse, label: 'nav.inventory', permission: 'canViewInventory' as const },
  { href: '/sales', icon: DollarSign, label: 'nav.sales', permission: 'canViewSales' as const },
  { href: '/purchases', icon: ShoppingBag, label: 'nav.purchases', permission: 'canViewPurchases' as const },
  { href: '/suppliers', icon: Truck, label: 'nav.suppliers', permission: 'canViewSuppliers' as const },
  { href: '/customers', icon: Users, label: 'nav.customers', permission: 'canViewCustomers' as const },
  { href: '/reports', icon: FileText, label: 'nav.reports', permission: 'canViewReports' as const },
  { href: '/crm', icon: MessageSquare, label: 'nav.crm', permission: 'canViewCRM' as const },
  { href: '/staff', icon: UserCog, label: 'nav.staff', permission: 'canViewStaff' as const },
  { href: '/woocommerce', icon: Store, label: 'nav.woocommerce', permission: 'canManageWooCommerce' as const },
  { href: '/settings', icon: Settings, label: 'nav.settings', permission: 'canManageSettings' as const },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t, ready } = useTranslation()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [mounted, setMounted] = useState(false)
  const { role, loading: roleLoading } = useUserRole()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredMenuItems = role && !roleLoading
    ? menuItems.filter(item => {
        const permissions = getPermissions(role as UserRole)
        return permissions[item.permission]
      })
    : menuItems

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (!mounted || !ready) {
    return (
      <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col md:min-h-screen">
        <div className="p-6 border-b border-gray-800 flex-shrink-0">
          <h1 className="text-xl font-bold">Sistema POS</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <div
                key={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
              </div>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 w-full">
            <LogOut className="w-5 h-5" />
            <span className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col md:min-h-screen">
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <h1 className="text-xl font-bold">Sistema POS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span suppressHydrationWarning>{t(item.label)}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full"
        >
          <LogOut className="w-5 h-5" />
          <span suppressHydrationWarning>{t('common.logout')}</span>
        </button>
      </div>
    </div>
  )
}

