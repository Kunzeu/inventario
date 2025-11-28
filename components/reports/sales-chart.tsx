'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SalesChartProps {
  data: { date: string; total: number }[]
  currency: string
}

export function SalesChart({ data, currency }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
        <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

