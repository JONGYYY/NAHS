"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface AttendancePoint {
  label: string;
  rate: number;
  present: number;
}

export function MemberAttendanceChart({ data }: { data: AttendancePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        No meetings yet to chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#33509e" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#33509e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#dad5c9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#6c665c" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#6c665c" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 4,
            border: "1px solid #dad5c9",
            backgroundColor: "#fbfaf6",
            fontSize: 12,
          }}
          formatter={(value) => [`${value}%`, "Attendance rate"]}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="#33509e"
          strokeWidth={2.5}
          fill="url(#rateFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
