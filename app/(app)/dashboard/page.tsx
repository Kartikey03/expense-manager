"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChartPie, Plus, Wallet } from "lucide-react";
import { useTxns } from "@/components/TransactionsProvider";
import { useUI } from "@/components/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { TransactionList } from "@/components/TransactionList";
import { BalanceArea, Breakdown, ChartFill, Donut, Legend, MonthlyBars, SERIES } from "@/components/charts/Charts";
import { availableMonths, byCategory, cumulativeBalance, monthlySeries, totals } from "@/lib/analytics";
import { monthKey, monthLabel, monthTitle } from "@/lib/format";

export default function DashboardPage() {
  const { txns, loading } = useTxns();
  const { openAdd } = useUI();
  const [month, setMonth] = useState("all");

  const months = useMemo(() => availableMonths(txns), [txns]);
  const filtered = useMemo(
    () => (month === "all" ? txns : txns.filter((t) => monthKey(t.txn_date) === month)),
    [txns, month]
  );
  const t = useMemo(() => totals(filtered), [filtered]);
  const monthly = useMemo(() => monthlySeries(txns), [txns]);
  const cumulative = useMemo(() => cumulativeBalance(monthly), [monthly]);
  const spending = useMemo(() => byCategory(filtered, "expense"), [filtered]);
  const recent = useMemo(() => filtered.slice(0, 6), [filtered]);
  const expenseCount = useMemo(() => filtered.filter((x) => x.type === "expense").length, [filtered]);

  if (loading) return <DashboardSkeleton />;

  const since = months.length ? monthTitle(months[months.length - 1]) : "";

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={month === "all" ? (since ? `Since ${since}` : "No activity yet") : monthTitle(month)}
        actions={
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="select h-9 w-auto rounded-full pl-4 text-[16px] sm:text-[14px]"
            aria-label="Period"
          >
            <option value="all">All time</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        }
      />

      {txns.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <p className="text-[17px] font-semibold">No transactions yet</p>
          <p className="caption mt-1">Add your first expense, income or investment.</p>
          <button onClick={openAdd} className="btn-primary mt-5">
            <Plus className="h-4 w-4" /> Add Transaction
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Income" value={t.income} icon={ArrowDownLeft} color={SERIES.income} sub={`Savings rate ${Math.round(t.savingsRate * 100)}%`} />
            <StatCard label="Expenses" value={t.expense} icon={ArrowUpRight} color={SERIES.expense} sub={`${expenseCount} transactions`} />
            <StatCard label="Invested" value={t.investment} icon={ChartPie} color={SERIES.investment} sub="Net of withdrawals" />
            <StatCard label="Free balance" value={t.balance} icon={Wallet} color="#64d2ff" sub="After spending & investing" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="card flex flex-col p-5 sm:p-6 lg:col-span-2">
              <SectionTitle
                title="Cash flow"
                hint="By month, all time"
                action={
                  <Legend
                    items={[
                      { label: "Income", color: SERIES.income },
                      { label: "Expenses", color: SERIES.expense },
                      { label: "Invested", color: SERIES.investment },
                    ]}
                  />
                }
              />
              <ChartFill min={260}>
                <MonthlyBars data={monthly} height="100%" />
              </ChartFill>
            </section>

            <section className="card p-5 sm:p-6">
              <SectionTitle title="Spending" hint={month === "all" ? "All time" : monthTitle(month)} />
              {spending.length ? (
                <>
                  <Donut data={spending} total={t.expense} label="Spent" />
                  <div className="mt-6">
                    <Breakdown data={spending} total={t.expense} limit={5} />
                  </div>
                </>
              ) : (
                <p className="py-12 text-center text-[15px] text-label-2">No spending in this period.</p>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="card flex flex-col p-5 sm:p-6 lg:col-span-2">
              <SectionTitle title="Balance" hint="Running free cash, month by month" />
              <ChartFill min={220}>
                <BalanceArea data={cumulative} height="100%" />
              </ChartFill>
            </section>

            <section className="card p-5 sm:p-6">
              <SectionTitle
                title="Recent"
                action={
                  <Link href="/transactions" className="btn-plain text-[14px]">
                    See All
                  </Link>
                }
              />
              <div className="-mx-1 sm:-mx-2">
                <TransactionList items={recent} emptyLabel="Nothing in this period." />
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-11 w-48 rounded-xl bg-surface" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-[118px]" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card h-[340px] lg:col-span-2" />
        <div className="card h-[340px]" />
      </div>
    </div>
  );
}
