"use client";

import type { LucideIcon } from "lucide-react";
import { CountUp } from "./CountUp";
import { formatINR } from "@/lib/format";

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
  raw = false,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  sub?: string;
  raw?: boolean;
}) {
  return (
    <div className="card flex min-w-0 flex-col p-4 sm:p-5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-[15px] w-[15px] shrink-0" style={{ color }} strokeWidth={2.25} />
        <span className="truncate text-[13px] font-medium text-label-2">{label}</span>
      </div>
      <p className="tabular mt-2 truncate text-[22px] font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
        <CountUp value={value} format={(n) => (raw ? String(Math.round(n)) : formatINR(n))} />
      </p>
      {sub && <p className="mt-1 truncate text-[12px] text-label-3 sm:text-[13px]">{sub}</p>}
    </div>
  );
}
