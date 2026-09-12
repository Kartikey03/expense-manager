"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useTxns } from "@/components/TransactionsProvider";
import { useUI } from "@/components/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { TransactionList } from "@/components/TransactionList";
import { availableMonths } from "@/lib/analytics";
import { monthKey, monthLabel, formatINR } from "@/lib/format";
import type { TxnType } from "@/lib/types";
import { TYPE_META } from "@/lib/categories";

const TYPE_FILTERS: ("all" | TxnType)[] = ["all", "income", "expense", "investment"];

export default function TransactionsPage() {
  const { txns, loading } = useTxns();
  const { openAdd } = useUI();
  const [type, setType] = useState<"all" | TxnType>("all");
  const [month, setMonth] = useState("all");
  const [q, setQ] = useState("");

  const months = useMemo(() => availableMonths(txns), [txns]);

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (month !== "all" && monthKey(t.txn_date) !== month) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!t.description.toLowerCase().includes(s) && !t.category.toLowerCase().includes(s))
          return false;
      }
      return true;
    });
  }, [txns, type, month, q]);

  const sum = useMemo(
    () => filtered.reduce((a, t) => a + (t.type === "expense" ? -t.amount : t.type === "income" ? t.amount : 0), 0),
    [filtered]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
          <p className="mt-1 text-sm text-white/45">
            {filtered.length} records · net{" "}
            <span className={sum >= 0 ? "text-accent-green" : "text-accent-red"}>
              {formatINR(sum, { sign: sum > 0 })}
            </span>
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary hidden items-center gap-2 sm:flex">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-1 rounded-xl bg-white/5 p-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setType(f)}
                className="relative rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors"
              >
                {type === f && (
                  <motion.div
                    layoutId="txntypefilter"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-500/70 to-accent-violet/70"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {f === "all" ? "All" : `${TYPE_META[f].emoji} ${TYPE_META[f].label}`}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              className="glass-input pl-9"
              placeholder="Search description or category…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select value={month} onChange={(e) => setMonth(e.target.value)} className="glass-input w-auto">
            <option value="all">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      <GlassCard className="p-4 sm:p-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <TransactionList items={filtered} emptyLabel="Nothing matches these filters." />
        )}
      </GlassCard>
    </div>
  );
}
