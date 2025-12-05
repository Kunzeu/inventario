'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, User, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  loyalty_points: number
}

interface CustomerSelectorProps {
  customerId: string | null
  onCustomerSelect: (id: string | null) => void
}

export function CustomerSelector({ customerId, onCustomerSelect }: CustomerSelectorProps) {
  const { t } = useTranslation()
  const supabase = createSupabaseClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (customerId) {
      loadSelectedCustomer(customerId)
    } else {
      setSelectedCustomer(null)
    }
  }, [customerId])

  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      searchCustomers(debouncedSearchTerm)
    } else {
      setShowResults(false)
      setSearchResults([])
    }
  }, [debouncedSearchTerm])

  const loadSelectedCustomer = async (id: string) => {
    const { data } = await supabase
      .from('customers')
      .select('id, name, email, phone, loyalty_points')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    if (data) {
      setSelectedCustomer(data)
    }
  }

  const searchCustomers = async (term: string) => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('customers')
        .select('id, name, email, phone, loyalty_points')
        .or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
        .eq('is_active', true)
        .limit(10)

      setSearchResults(data || [])
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    onCustomerSelect(customer.id)
    setSearchTerm('')
    setShowResults(false)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    onCustomerSelect(null)
    setSearchTerm('')
  }

  // Calcular descuento basado en puntos (ejemplo: 100 puntos = 1% de descuento, máximo 10%)
  const calculateDiscount = (points: number) => {
    const discountPercent = Math.min(Math.floor(points / 100), 10)
    return discountPercent
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{t('pos.customer')}</label>

      {selectedCustomer ? (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm">{selectedCustomer.name}</p>
                  {selectedCustomer.email && (
                    <p className="text-xs text-gray-600">{selectedCustomer.email}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-blue-600">
                      {t('customers.loyaltyPoints')}: <strong>{selectedCustomer.loyalty_points || 0} {t('pos.points')}</strong>
                    </span>
                    {calculateDiscount(selectedCustomer.loyalty_points || 0) > 0 && (
                      <span className="text-xs text-green-600">
                        {t('pos.discountAvailable')}: <strong>{calculateDiscount(selectedCustomer.loyalty_points || 0)}%</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearCustomer}
              className="text-blue-600 hover:bg-blue-100"
            >
              <XCircle className="w-4 h-4 mr-1" />
              {t('common.clear')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <Input
            placeholder={t('pos.searchCustomer')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
            }}
            onFocus={() => searchTerm.length > 2 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 100)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          {showResults && searchResults.length > 0 && (
            <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
              <CardContent className="p-0">
                {searchResults.map((customer) => (
                  <Button
                    key={customer.id}
                    variant="ghost"
                    className="w-full justify-start text-left p-3 rounded-none"
                    onMouseDown={() => handleSelectCustomer(customer)}
                  >
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      {customer.email && <p className="text-xs text-gray-500">{customer.email}</p>}
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
          {showResults && searchResults.length === 0 && !loading && searchTerm.length > 2 && (
            <Card className="absolute z-10 w-full mt-1 shadow-lg">
              <CardContent className="p-3 text-center text-gray-500">
                {t('pos.noCustomersFound')}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

