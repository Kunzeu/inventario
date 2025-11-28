'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { Store, RefreshCw, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCompanyLocaleClient } from '@/lib/get-currency-client'

export default function WooCommercePage() {
  const { t } = useTranslation()
  const [connection, setConnection] = useState<any>(null)
  const [storeUrl, setStoreUrl] = useState('')
  const [consumerKey, setConsumerKey] = useState('')
  const [consumerSecret, setConsumerSecret] = useState('')
  const [locale, setLocale] = useState('es-CO')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadConnection()
    loadLocale()
  }, [])

  const loadLocale = async () => {
    const localeValue = await getCompanyLocaleClient()
    setLocale(localeValue)
  }

  const loadConnection = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('woocommerce_connections')
      .select('*')
      .eq('is_active', true)
      .single()

    if (data) {
      setConnection(data)
      setStoreUrl(data.store_url)
      setConsumerKey(data.consumer_key)
      setConsumerSecret(data.consumer_secret)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error(t('errors.noSession'))

      if (connection) {
        const { error } = await supabase
          .from('woocommerce_connections')
          .update({
            store_url: storeUrl,
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
          })
          .eq('id', connection.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('woocommerce_connections')
          .insert({
            store_url: storeUrl,
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
          })

        if (error) throw error
      }

      toast.success(t('woocommerce.saved'))
      loadConnection()
    } catch (error: any) {
      toast.error(error.message || t('woocommerce.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!storeUrl || !consumerKey || !consumerSecret) {
      toast.error(t('woocommerce.fillAllFields'))
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/woocommerce/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeUrl, consumerKey, consumerSecret }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('woocommerce.connectionFailed'))
      }

      toast.success(t('woocommerce.connectionSuccess'))
    } catch (error: any) {
      toast.error(error.message || t('woocommerce.connectionFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleSyncProducts = async () => {
    if (!connection) {
      toast.error(t('woocommerce.noConnection'))
      return
    }

    setLoading(true)
    try {
      toast.loading(t('woocommerce.syncingProducts'), { id: 'sync' })

      const response = await fetch('/api/woocommerce/sync-products', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('woocommerce.syncError'))
      }

      toast.success(
        t('woocommerce.productsSynced', { 
          created: data.created, 
          updated: data.updated 
        }), 
        { id: 'sync' }
      )
      loadConnection()
    } catch (error: any) {
      toast.error(error.message || t('woocommerce.syncError'), { id: 'sync' })
    } finally {
      setLoading(false)
    }
  }

  const handleSyncOrders = async () => {
    if (!connection) {
      toast.error(t('woocommerce.noConnection'))
      return
    }

    setLoading(true)
    try {
      toast.loading(t('woocommerce.syncingOrders'), { id: 'sync-orders' })

      const response = await fetch('/api/woocommerce/sync-orders', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('woocommerce.syncError'))
      }

      toast.success(
        t('woocommerce.ordersSynced', { count: data.synced }), 
        { id: 'sync-orders' }
      )
      loadConnection()
    } catch (error: any) {
      toast.error(error.message || t('woocommerce.syncError'), { id: 'sync-orders' })
    } finally {
      setLoading(false)
    }
  }


  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('woocommerce.title')}</h1>

        {/* Documentación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              {t('woocommerce.howToConfigure')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold mb-1">{t('woocommerce.step1')}</p>
                <p>{t('woocommerce.step1Description')}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">{t('woocommerce.step2')}</p>
                <p>{t('woocommerce.step2Description')}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">{t('woocommerce.step3')}</p>
                <p>{t('woocommerce.step3Description')}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">{t('woocommerce.step4')}</p>
                <p>{t('woocommerce.step4Description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="w-5 h-5 mr-2" />
              {t('woocommerce.connectionSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('woocommerce.storeUrl')}</label>
              <Input
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://mitienda.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('woocommerce.consumerKey')}</label>
              <Input
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                placeholder="ck_..."
                type="password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('woocommerce.consumerSecret')}</label>
              <Input
                value={consumerSecret}
                onChange={(e) => setConsumerSecret(e.target.value)}
                placeholder="cs_..."
                type="password"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={loading}>
                {t('woocommerce.saveConnection')}
              </Button>
              <Button onClick={handleTestConnection} variant="outline" disabled={loading || !storeUrl || !consumerKey || !consumerSecret}>
                {t('woocommerce.testConnection')}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}

