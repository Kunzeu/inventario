/**
 * Mapea una moneda a su locale apropiado
 * Esta función es pura y no tiene dependencias del servidor,
 * por lo que puede usarse tanto en Server como Client Components
 * @param currency Código de moneda (USD, COP, EUR, etc.)
 * @returns Locale string (es-CO, en-US, es-ES, etc.)
 */
export function getLocaleFromCurrency(currency: string): string {
  const currencyLocaleMap: { [key: string]: string } = {
    'USD': 'en-US',
    'COP': 'es-CO',
    'MXN': 'es-MX',
    'EUR': 'es-ES',
    'GBP': 'en-GB',
  }
  
  return currencyLocaleMap[currency] || 'es-CO'
}

