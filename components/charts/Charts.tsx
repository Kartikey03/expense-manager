"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatINR, monthLabel } from "@/lib/format";
import { catColor } from "@/lib/categories";
import type { CatSlice, MonthlyRow } from "@/lib/analytics";

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      {label && <p className="mb-1 font-semibold text-white/80">{monthLabel(label)}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize text-white/60">{p.name}:</span>
          <span className="font-medium">{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyBars({ data }: { data: MonthlyRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="key" tickFormatter={(k) => monthLabel(k).split(" ")[0]} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatINR(v, { compact: true })} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="income" name="Income" fill="#34d399" radius={[5, 5, 0, 0]} maxBarSize={26} />
        <Bar dataKey="expense" name="Expense" fill="#fb7185" radius={[5, 5, 0, 0]} maxBarSize={26} />
        <Bar dataKey="investment" name="Investment" fill="#818cf8" radius={[5, 5, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BalanceArea({ data }: { data: { key: string; balance: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="key" tickFormatter={(k) => monthLabel(k).split(" ")[0]} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatINR(v, { compact: true })} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<GlassTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
        <Area type="monotone" dataKey="balance" name="Cumulative balance" stroke="#818cf8" strokeWidth={2.5} fill="url(#balGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ data, total }: { data: CatSlice[]; total: number }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="category"
            innerRadius={70}
            outerRadius={104}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.category} fill={catColor(d.category)} />
            ))}
          </Pie>
          <Tooltip content={<GlassTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-white/45">Total</span>
        <span className="text-xl font-bold">{formatINR(total, { compact: true })}</span>
      </div>
    </div>
  );
}
