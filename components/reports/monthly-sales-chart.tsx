'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface MonthlySalesChartProps {
  data: { month: string; total: number }[]
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
        <Bar dataKey="total" fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  )
}

