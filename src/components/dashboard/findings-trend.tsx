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

const SEVERITY_LABELS: Record<string, string> = {
  critical: "重大",
  high: "高",
  medium: "中",
  low: "低",
};

const SEVERITY_COLORS = {
  critical: "#DC2626",
  high: "#EA580C",
  medium: "#D97706",
  low: "#2563EB",
};

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${parseInt(month)}月${parseInt(day)}日`;
}

export function FindingsTrend({ data }: FindingsTrendProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-muted">
        監査データがありません
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4">
        {(["critical", "high", "medium", "low"] as const).map((key) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: SEVERITY_COLORS[key] }}
            />
            <span className="text-xs text-ink-muted">{SEVERITY_LABELS[key]}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
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
            formatter={(value, name) => [value, SEVERITY_LABELS[String(name)] ?? name]}
            labelFormatter={(label) => (typeof label === "string" ? formatDate(label) : label)}
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
    </div>
  );
}
