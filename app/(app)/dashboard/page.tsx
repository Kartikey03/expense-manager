"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  ArrowUpRight,
} from "lucide-react";
import { useTxns } from "@/components/TransactionsProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { TransactionList } from "@/components/TransactionList";
import { MonthlyBars, BalanceArea, CategoryDonut } from "@/components/charts/Charts";
import {
  availableMonths,
  byCategory,
  cumulativeBalance,
  monthlySeries,
  totals,
} from "@/lib/analytics";
import { monthKey, monthLabel, formatINR } from "@/lib/format";
import { catColor } from "@/lib/categories";

export default function DashboardPage() {
  const { txns, loading } = useTxns();
  const [month, setMonth] = useState<string>("all");

  const months = useMemo(() => availableMonths(txns), [txns]);
  const filtered = useMemo(
    () => (month === "all" ? txns : txns.filter((t) => monthKey(t.txn_date) === month)),
    [txns, month]
  );

  const t = useMemo(() => totals(filtered), [filtered]);
  const monthly = useMemo(() => monthlySeries(txns), [txns]);
  const cumulative = useMemo(() => cumulativeBalance(monthly), [monthly]);
  const expenseCats = useMemo(() => byCategory(filtered, "expense"), [filtered]);
  const recent = useMemo(() => filtered.slice(0, 8), [filtered]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <Header month={month} setMonth={setMonth} months={months} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Income" value={t.income} accent="#34d399" delay={0.02}
          icon={<TrendingUp className="h-5 w-5" />}
          sub={`Savings rate ${(t.savingsRate * 100).toFixed(0)}%`} />
        <StatCard label="Expenses" value={t.expense} accent="#fb7185" delay={0.06}
          icon={<TrendingDown className="h-5 w-5" />}
          sub={`${filtered.filter((x) => x.type === "expense").length} transactions`} />
        <StatCard label="Invested (net)" value={t.investment} accent="#818cf8" delay={0.1}
          icon={<PiggyBank className="h-5 w-5" />}
          sub="After withdrawals" />
        <StatCard label="Free balance" value={t.balance} accent="#2dd4bf" delay={0.14}
          icon={<Wallet className="h-5 w-5" />}
          sub="Income − spent − invested" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard delay={0.18} className="p-5 lg:col-span-2">
          <SectionTitle title="Monthly flow" hint="Income vs expense vs investment" />
          <MonthlyBars data={monthly} />
        </GlassCard>

        <GlassCard delay={0.22} className="p-5">
          <SectionTitle title="Spending mix" hint={month === "all" ? "All time" : monthLabel(month)} />
          {expenseCats.length ? (
            <>
              <CategoryDonut data={expenseCats} total={t.expense} />
              <div className="mt-3 space-y-1.5">
                {expenseCats.slice(0, 5).map((c) => (
                  <div key={c.category} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: catColor(c.category) }} />
                    <span className="flex-1 text-white/60">{c.category}</span>
                    <span className="font-medium">{formatINR(c.value, { compact: true })}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-sm text-white/40">No expenses in this period.</p>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard delay={0.26} className="p-5 lg:col-span-2">
          <SectionTitle title="Cumulative balance" hint="Running free cash over the year" />
          <BalanceArea data={cumulative} />
        </GlassCard>

        <GlassCard delay={0.3} className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <SectionTitle title="Recent activity" />
            <a href="/transactions" className="flex items-center gap-1 text-xs text-brand-300 hover:text-brand-400">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <TransactionList items={recent} />
        </GlassCard>
      </div>
    </div>
  );
}

function Header({
  month,
  setMonth,
  months,
}: {
  month: string;
  setMonth: (m: string) => void;
  months: string[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Overview
        </motion.h1>
        <p className="mt-1 text-sm text-white/45">Here's where your money stands.</p>
      </div>
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="glass-input w-full sm:w-48"
      >
        <option value="all">All time</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {monthLabel(m)}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-9 w-48 rounded-xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="skeleton h-80 rounded-2xl lg:col-span-2" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  );
}
