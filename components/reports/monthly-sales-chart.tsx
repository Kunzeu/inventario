'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface MonthlySalesChartProps {
  data: Array<{ month: string; total: number }>
  currency: string
}

export function MonthlySalesChart({ data, currency }: MonthlySalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
        <Legend />
        <Bar dataKey="total" fill="#8884d8" name="Ventas" />
      </BarChart>
    </ResponsiveContainer>
  )
}

