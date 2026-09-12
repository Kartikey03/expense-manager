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
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/55">{label}</p>
          <p className="mt-2 text-[1.7rem] font-bold leading-none tracking-tight">
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
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}
