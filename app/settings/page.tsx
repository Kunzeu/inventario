'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { Settings as SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const [company, setCompany] = useState<any>(null)
  const [name, setName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('COP')
  const [language, setLanguage] = useState('es')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadCompany()
  }, [])

  useEffect(() => {
    // Sincronizar idioma cuando se carga la configuración
    if (language && language !== i18n.language) {
      i18n.changeLanguage(language)
    }
  }, [language])

  const loadCompany = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Obtener configuración única de la empresa
    const { data } = await supabase
      .from('company_settings')
      .select('*')
      .single()

    if (data) {
      setCompany(data)
      setName(data.name)
      setTaxId(data.tax_id || '')
      setAddress(data.address || '')
      setPhone(data.phone || '')
      setEmail(data.email || '')
      setCurrency(data.currency || 'COP')
      setLanguage(data.language || 'es')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validar email si se proporciona
      if (email && email.trim().length > 0) {
        if (email.length < 5) {
          toast.error(t('validation.emailMinLength'))
          setLoading(false)
          return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          toast.error(t('validation.emailInvalid'))
          setLoading(false)
          return
        }
      }

      // Actualizar la configuración única (siempre el mismo ID)
      const { error } = await supabase
        .from('company_settings')
        .update({
          name,
          tax_id: taxId,
          address,
          phone,
          email: email && email.trim().length >= 5 ? email.trim() : null,
          currency,
          language,
        })
        .eq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error

      // Cambiar idioma si se actualizó
      if (language !== i18n.language) {
        i18n.changeLanguage(language)
      }

      toast.success(t('settings.saved'))
      loadCompany()
    } catch (error: any) {
      toast.error(error.message || t('settings.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              {t('settings.companyInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.companyName')}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi Empresa S.A."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.taxId')}</label>
              <Input
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="RFC123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.address')}</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, Ciudad, País"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.phone')}</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 123 456 7890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.email')}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                minLength={5}
                placeholder="contacto@empresa.com"
              />
              {email && email.length > 0 && email.length < 5 && (
                <p className="text-xs text-red-500 mt-1">{t('validation.emailMinLength')}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.currency')}</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="USD">USD - Dólar</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - Libra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.language')}</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {t('settings.saveChanges')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

