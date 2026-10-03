// Chart pieces that don't depend on Recharts, so pages can render them
// without waiting for the (lazy-loaded) chart library.
import { formatINR } from "@/lib/format";
import { catColor } from "@/lib/categories";
import type { CatSlice } from "@/lib/analytics";

export const SERIES = { income: "#30d158", expense: "#ff453a", investment: "#0a84ff" };

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5 text-[12px] text-label-2">
          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Lets a chart fill whatever height its card is given by the grid row, without
 * contributing to that height itself (absolute child → no resize feedback loop).
 */
export function ChartFill({ min = 240, children }: { min?: number; children: React.ReactNode }) {
  return (
    <div className="relative flex-1" style={{ minHeight: min }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

/** Screen Time–style ranked list with proportional bars. */
export function Breakdown({ data, total, limit }: { data: CatSlice[]; total: number; limit?: number }) {
  const rows = limit ? data.slice(0, limit) : data;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((d) => {
        const pct = total > 0 ? (d.value / total) * 100 : 0;
        return (
          <li key={d.category}>
            <div className="flex items-baseline justify-between gap-3 text-[14px]">
              <span className="truncate">{d.category}</span>
              <span className="tabular shrink-0">
                {formatINR(d.value)}
                <span className="ml-2 inline-block w-9 text-right text-[12px] text-label-2">{pct.toFixed(0)}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, background: catColor(d.category) }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
