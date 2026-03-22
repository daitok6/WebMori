"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TrendPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface FindingsTrendProps {
  data: TrendPoint[];
}

export function FindingsTrend({ data }: FindingsTrendProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-muted">
        No audit data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#78716C" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#78716C" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #E7E5E4",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="critical"
          stackId="1"
          stroke="#DC2626"
          fill="#DC2626"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="high"
          stackId="1"
          stroke="#EA580C"
          fill="#EA580C"
          fillOpacity={0.5}
        />
        <Area
          type="monotone"
          dataKey="medium"
          stackId="1"
          stroke="#D97706"
          fill="#D97706"
          fillOpacity={0.4}
        />
        <Area
          type="monotone"
          dataKey="low"
          stackId="1"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
