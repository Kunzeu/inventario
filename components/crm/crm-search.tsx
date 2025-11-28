'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface CustomerWithStats {
  id: string
  name: string
  email: string | null
  loyalty_points: number | null
  totalSpent: number
  purchaseCount: number
  lastPurchase: Date | null
}

interface CRMSearchProps {
  customers: CustomerWithStats[]
  currency: string
  locale: string
}

export function CRMSearch({ customers, currency, locale }: CRMSearchProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) {
      return customers
    }

    const term = searchTerm.toLowerCase().trim()
    return customers.filter(customer => {
      const name = customer.name?.toLowerCase() || ''
      const email = customer.email?.toLowerCase() || ''
      const totalSpent = formatCurrency(customer.totalSpent, currency).toLowerCase()
      const purchaseCount = customer.purchaseCount.toString()
      const loyaltyPoints = (customer.loyalty_points || 0).toString()

      return (
        name.includes(term) ||
        email.includes(term) ||
        totalSpent.includes(term) ||
        purchaseCount.includes(term) ||
        loyaltyPoints.includes(term)
      )
    })
  }, [customers, searchTerm, currency])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <CardTitle>{t('crm.customersAndStats')}</CardTitle>
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('crm.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? t('crm.noResults') : t('crm.noCustomers')}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">{t('crm.customer')}</th>
                  <th className="text-left p-4">{t('crm.email')}</th>
                  <th className="text-left p-4">{t('crm.purchases')}</th>
                  <th className="text-left p-4">{t('crm.totalSpent')}</th>
                  <th className="text-left p-4">{t('crm.lastPurchase')}</th>
                  <th className="text-left p-4">{t('crm.loyaltyPoints')}</th>
                  <th className="text-left p-4">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{customer.name}</td>
                    <td className="p-4">{customer.email || '-'}</td>
                    <td className="p-4">{customer.purchaseCount}</td>
                    <td className="p-4 font-bold">{formatCurrency(customer.totalSpent, currency)}</td>
                    <td className="p-4">
                      {customer.lastPurchase 
                        ? new Date(customer.lastPurchase).toLocaleDateString(locale)
                        : t('crm.never')
                      }
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {customer.loyalty_points || 0} {t('customers.points')}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">{t('customers.viewDetails')}</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-lg">{customer.name}</p>
                      {customer.email && <p className="text-sm text-gray-500">{customer.email}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">{t('crm.purchases')}: </span>
                        <span className="font-semibold">{customer.purchaseCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('crm.totalSpent')}: </span>
                        <span className="font-bold">{formatCurrency(customer.totalSpent, currency)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('crm.lastPurchase')}: </span>
                        <span>
                          {customer.lastPurchase 
                            ? new Date(customer.lastPurchase).toLocaleDateString(locale)
                            : t('crm.never')
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('crm.loyaltyPoints')}: </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {customer.loyalty_points || 0} {t('customers.points')}
                        </span>
                      </div>
                    </div>
                    <Link href={`/customers/${customer.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">{t('customers.viewDetails')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

