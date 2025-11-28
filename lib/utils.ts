import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getLocaleFromCurrency } from './currency-locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un monto como moneda
 * @param amount Monto a formatear
 * @param currency Código de moneda (USD, COP, EUR, etc.)
 * @param locale Locale opcional. Si no se proporciona, se determina automáticamente según la moneda
 * @returns String formateado (ej: "$1.000,00" para COP, "$1,000.00" para USD)
 */
export function formatCurrency(amount: number, currency: string = 'COP', locale?: string): string {
  const formatLocale = locale || getLocaleFromCurrency(currency)
  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Formatea una fecha
 * @param date Fecha a formatear
 * @param locale Locale opcional. Por defecto usa 'es-CO'
 * @returns String formateado (ej: "15 de enero de 2024")
 */
export function formatDate(date: string | Date, locale: string = 'es-CO'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function generateSaleNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `SALE-${timestamp}-${random}`
}

export function generatePurchaseNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `PURCH-${timestamp}-${random}`
}

