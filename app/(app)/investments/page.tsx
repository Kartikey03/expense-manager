"use client";

import { useMemo } from "react";
import { PiggyBank, ArrowDownCircle, ArrowUpCircle, Layers } from "lucide-react";
import { useTxns } from "@/components/TransactionsProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { TransactionList } from "@/components/TransactionList";
import { CategoryDonut } from "@/components/charts/Charts";
import { investmentPositions } from "@/lib/analytics";
import { catColor } from "@/lib/categories";
import { formatINR } from "@/lib/format";

export default function InvestmentsPage() {
  const { txns, loading } = useTxns();

  const invest = useMemo(() => txns.filter((t) => t.type === "investment"), [txns]);
  const contributions = useMemo(
    () => invest.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0),
    [invest]
  );
  const withdrawals = useMemo(
    () => invest.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0),
    [invest]
  );
  const net = contributions - withdrawals;
  const positions = useMemo(() => investmentPositions(invest), [invest]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Investments</h1>
        <p className="mt-1 text-sm text-white/45">Portfolio contributions, withdrawals & mix.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Net invested" value={net} accent="#818cf8" delay={0.02}
          icon={<PiggyBank className="h-5 w-5" />} sub="Contributions − withdrawals" />
        <StatCard label="Total put in" value={contributions} accent="#34d399" delay={0.06}
          icon={<ArrowUpCircle className="h-5 w-5" />} sub={`${invest.filter((t) => t.amount > 0).length} buys`} />
        <StatCard label="Withdrawn" value={withdrawals} accent="#fbbf24" delay={0.1}
          icon={<ArrowDownCircle className="h-5 w-5" />} sub={`${invest.filter((t) => t.amount < 0).length} exits`} />
        <StatCard label="Instruments" value={positions.length} accent="#2dd4bf" delay={0.14} raw
          icon={<Layers className="h-5 w-5" />} sub="Active categories" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard delay={0.18} className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Portfolio mix</h3>
          {positions.length ? (
            <>
              <CategoryDonut data={positions} total={positions.reduce((a, p) => a + p.value, 0)} />
              <div className="mt-3 space-y-1.5">
                {positions.map((c) => (
                  <div key={c.category} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: catColor(c.category) }} />
                    <span className="flex-1 text-white/60">{c.category}</span>
                    <span className="font-medium">{formatINR(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-sm text-white/40">No investments yet.</p>
          )}
        </GlassCard>

        <GlassCard delay={0.22} className="p-4 sm:p-5 lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold">Investment ledger</h3>
          <p className="mb-2 text-xs text-white/40">Negative = withdrawal.</p>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <TransactionList items={invest} emptyLabel="No investment records." />
          )}
        </GlassCard>
      </div>
    </div>
  );
}
