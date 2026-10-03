"use client";

import dynamic from "next/dynamic";

// Recharts is ~100 KB; keep it out of the initial page bundle. AppShell
// preloads this chunk when the browser is idle, so charts appear instantly.
export const loadCharts = () => import("./Charts");

export const MonthlyBars = dynamic(() => loadCharts().then((m) => m.MonthlyBars), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export const BalanceArea = dynamic(() => loadCharts().then((m) => m.BalanceArea), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export const Donut = dynamic(() => loadCharts().then((m) => m.Donut), {
  ssr: false,
  loading: () => <div className="mx-auto aspect-square w-full max-w-[200px]" />,
});
