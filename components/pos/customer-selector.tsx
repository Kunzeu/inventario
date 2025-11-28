'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  loyalty_points: number
}

interface CustomerSelectorProps {
  customerId: string | null
  onCustomerSelect: (customerId: string | null) => void
}

export function CustomerSelector({ customerId, onCustomerSelect }: CustomerSelectorProps) {
  const { t } = useTranslation()
  const supabase = createSupabaseClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customerId) {
      loadCustomer(customerId)
    } else {
      setSelectedCustomer(null)
    }
  }, [customerId])

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchCustomers()
    } else {
      setCustomers([])
      setShowResults(false)
    }
  }, [searchTerm])

  const loadCustomer = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, loyalty_points')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      if (data) setSelectedCustomer(data)
    } catch (error: any) {
      console.error('Error loading customer:', error)
    }
  }

  const searchCustomers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, loyalty_points')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) throw error
      setCustomers(data || [])
      setShowResults(true)
    } catch (error: any) {
      toast.error(error.message || t('customers.errorSearching'))
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
                      {t('customers.loyaltyPoints')}: <strong>{selectedCustomer.loyalty_points || 0}</strong>
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
              className="ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <Input
              type="text"
              placeholder={t('pos.searchCustomer')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {showResults && customers.length > 0 && (
            <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
              <CardContent className="p-2">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      {customer.email && (
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      )}
                    </div>
                    <span className="text-xs text-blue-600">
                      {customer.loyalty_points || 0} {t('customers.points')}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {showResults && searchTerm.length >= 2 && customers.length === 0 && !loading && (
            <Card className="absolute z-10 w-full mt-1">
              <CardContent className="p-4 text-center text-gray-500 text-sm">
                {t('customers.noCustomersFound')}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

