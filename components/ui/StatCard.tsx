"use client";

import { GlassCard } from "./GlassCard";
import { CountUp } from "./CountUp";
import { formatINR } from "@/lib/format";
import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  accent,
  sub,
  delay = 0,
  signed = false,
  raw = false,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
  sub?: string;
  delay?: number;
  signed?: boolean;
  raw?: boolean;
}) {
  return (
    <GlassCard delay={delay} hover className="relative overflow-hidden p-5">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-40"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-white/55 sm:text-sm">{label}</p>
          <p className="mt-2 text-[1.35rem] font-bold leading-tight tracking-tight tabular-nums sm:text-[1.7rem]">
            <CountUp
              value={value}
              format={(n) =>
                raw
                  ? String(Math.round(n))
                  : formatINR(n, { sign: signed && n > 0 })
              }
            />
          </p>
          {sub && <p className="mt-2 text-xs text-white/45">{sub}</p>}
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}
