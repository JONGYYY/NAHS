"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface BarPoint {
  label: string;
  value: number;
  color?: string;
}

export function SimpleBar({
  data,
  color = "#33509e",
  height = 260,
  suffix = "",
}: {
  data: BarPoint[];
  color?: string;
  height?: number;
  suffix?: string;
}) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dad5c9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#6c665c" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#6c665c" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(28,24,21,0.05)" }}
          contentStyle={{ borderRadius: 4, border: "1px solid #dad5c9", backgroundColor: "#fbfaf6", fontSize: 12 }}
          formatter={(value) => [`${value}${suffix}`, ""]}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
