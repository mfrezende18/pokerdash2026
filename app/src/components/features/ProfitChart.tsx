"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface ProfitChartProps {
  data: Array<{ date: string; profit: number }>
}

export function ProfitChart({ data }: ProfitChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#53e16f" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#53e16f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e7" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#5d5e63" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e2e7" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#5d5e63" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e2e7" }}
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid #e2e2e7",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              fontSize: "14px",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [
              `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              "Lucro",
            ]}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#00993b"
            strokeWidth={2}
            fill="url(#profitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
