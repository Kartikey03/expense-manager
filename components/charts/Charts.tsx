"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR, monthLabel } from "@/lib/format";
import { catColor } from "@/lib/categories";
import type { CatSlice, MonthlyRow } from "@/lib/analytics";
import { SERIES } from "./parts";

const AXIS = { fill: "#86868b", fontSize: 12 };
const GRID = "rgba(255,255,255,0.07)";

/**
 * Charts animate on first paint only. Re-animating whenever data changes
 * (e.g. after adding a transaction) is what made the dashboard "jump".
 */
function useIntroAnimation() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 900);
    return () => clearTimeout(t);
  }, []);
  return on;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-surface-3 px-3 py-2 text-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
      {label && <p className="mb-1 font-semibold">{monthLabel(label)}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-label-2">{p.name}</span>
          <span className="tabular ml-auto pl-3 font-medium">{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyBars({ data, height = 260 }: { data: MonthlyRow[]; height?: number | `${number}%` }) {
  const animate = useIntroAnimation();
  return (
    <ResponsiveContainer width="100%" height={height} debounce={80}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barGap={2} barCategoryGap="22%">
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="key" tickFormatter={(k) => monthLabel(k).split(" ")[0]} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatINR(v, { compact: true })} tick={AXIS} axisLine={false} tickLine={false} width={52} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="income" name="Income" fill={SERIES.income} radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={animate} animationDuration={450} />
        <Bar dataKey="expense" name="Expenses" fill={SERIES.expense} radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={animate} animationDuration={450} />
        <Bar dataKey="investment" name="Invested" fill={SERIES.investment} radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={animate} animationDuration={450} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BalanceArea({ data, height = 220 }: { data: { key: string; balance: number }[]; height?: number | `${number}%` }) {
  const animate = useIntroAnimation();
  return (
    <ResponsiveContainer width="100%" height={height} debounce={80}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="key" tickFormatter={(k) => monthLabel(k).split(" ")[0]} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatINR(v, { compact: true })} tick={AXIS} axisLine={false} tickLine={false} width={52} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.18)" }} />
        <Area
          type="monotone"
          dataKey="balance"
          name="Balance"
          stroke={SERIES.investment}
          strokeWidth={2}
          fill={SERIES.investment}
          fillOpacity={0.12}
          isAnimationActive={animate}
          animationDuration={450}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, total, label = "Total" }: { data: CatSlice[]; total: number; label?: string }) {
  const animate = useIntroAnimation();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[200px]">
      <ResponsiveContainer width="100%" height="100%" debounce={80}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="category"
            innerRadius="72%"
            outerRadius="100%"
            paddingAngle={1.5}
            cornerRadius={3}
            stroke="none"
            isAnimationActive={animate}
            animationDuration={450}
          >
            {data.map((d) => (
              <Cell key={d.category} fill={catColor(d.category)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[12px] text-label-2">{label}</span>
        <span className="tabular text-[20px] font-semibold tracking-[-0.02em]">{formatINR(total, { compact: true })}</span>
      </div>
    </div>
  );
}
