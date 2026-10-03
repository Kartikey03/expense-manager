"use client";

import { useMemo } from "react";
import { ArrowDownToLine, ArrowUpRight, ChartPie, Layers } from "lucide-react";
import { useTxns } from "@/components/TransactionsProvider";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { TransactionList } from "@/components/TransactionList";
import { Breakdown, Donut } from "@/components/charts/Charts";
import { investmentPositions } from "@/lib/analytics";

export default function InvestmentsPage() {
  const { txns, loading } = useTxns();

  const invest = useMemo(() => txns.filter((t) => t.type === "investment"), [txns]);
  const putIn = useMemo(() => invest.filter((t) => t.amount > 0), [invest]);
  const out = useMemo(() => invest.filter((t) => t.amount < 0), [invest]);
  const contributions = putIn.reduce((a, t) => a + t.amount, 0);
  const withdrawals = out.reduce((a, t) => a + Math.abs(t.amount), 0);
  // Donut can't show negative slices — keep instruments with money still in.
  const positions = useMemo(() => investmentPositions(invest).filter((p) => p.value > 0), [invest]);
  const positionsTotal = positions.reduce((a, p) => a + p.value, 0);

  return (
    <>
      <PageHeader title="Investments" subtitle="Contributions, withdrawals and where your money sits." />

      {loading ? (
        <div className="grid animate-pulse grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-[118px]" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Net invested" value={contributions - withdrawals} icon={ChartPie} color="#0a84ff" sub="Put in − withdrawn" />
            <StatCard label="Put in" value={contributions} icon={ArrowUpRight} color="#30d158" sub={`${putIn.length} contributions`} />
            <StatCard label="Withdrawn" value={withdrawals} icon={ArrowDownToLine} color="#ff9f0a" sub={`${out.length} withdrawals`} />
            <StatCard label="Instruments" value={positions.length} icon={Layers} color="#63e6e2" sub="With money in" raw />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="card p-5 sm:p-6 lg:sticky lg:top-[76px] lg:self-start">
              <SectionTitle title="Allocation" hint="Total contributed per instrument" />
              {positions.length ? (
                <>
                  <Donut data={positions} total={positionsTotal} label="Contributed" />
                  <div className="mt-6">
                    <Breakdown data={positions} total={positionsTotal} />
                  </div>
                </>
              ) : (
                <p className="py-12 text-center text-[15px] text-label-2">No investments yet.</p>
              )}
            </section>

            <section className="card p-5 sm:p-6 lg:col-span-2">
              <SectionTitle title="Activity" hint="Withdrawals are shown in orange." />
              <div className="-mx-1 sm:-mx-2">
                <TransactionList items={invest} emptyLabel="No investment records." />
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
