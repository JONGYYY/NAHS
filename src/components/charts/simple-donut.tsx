"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function SimpleDonut({
  data,
  centerValue,
  centerLabel,
  suffix = "",
}: {
  data: DonutDatum[];
  centerValue?: React.ReactNode;
  centerLabel?: string;
  suffix?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
        No data yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 4, border: "1px solid #dad5c9", backgroundColor: "#fbfaf6", fontSize: 12 }}
              formatter={(value) => [`${value}${suffix}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold tabular-nums">{centerValue ?? total}</span>
          {centerLabel ? (
            <span className="eyebrow mt-0.5">{centerLabel}</span>
          ) : null}
        </div>
      </div>
      <ul className="w-full space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-[2px]"
                style={{ backgroundColor: d.color }}
                aria-hidden="true"
              />
              {d.name}
            </span>
            <span className="font-medium">
              {d.value}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
