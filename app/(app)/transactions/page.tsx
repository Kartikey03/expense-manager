"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Download, Plus, Search, X } from "lucide-react";
import { useTxns } from "@/components/TransactionsProvider";
import { useUI } from "@/components/AppShell";
import { TransactionList } from "@/components/TransactionList";
import { PageHeader } from "@/components/ui/PageHeader";
import { Segmented } from "@/components/ui/Segmented";
import { availableMonths } from "@/lib/analytics";
import { formatINR, monthKey, monthLabel, monthTitle } from "@/lib/format";
import type { Transaction, TxnType } from "@/lib/types";

type Filter = "all" | TxnType;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "expense", label: "Expenses" },
  { value: "income", label: "Income" },
  { value: "investment", label: "Invested" },
];

export default function TransactionsPage() {
  const { txns, loading } = useTxns();
  const { openAdd, openExport } = useUI();
  const [type, setType] = useState<Filter>("all");
  const [month, setMonth] = useState("all");
  const [query, setQuery] = useState("");
  // Keeps typing responsive: filtering re-renders at lower priority.
  const q = useDeferredValue(query.trim().toLowerCase());

  const months = useMemo(() => availableMonths(txns), [txns]);

  const filtered = useMemo(
    () =>
      txns.filter(
        (t) =>
          (type === "all" || t.type === type) &&
          (month === "all" || monthKey(t.txn_date) === month) &&
          (!q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
      ),
    [txns, type, month, q]
  );

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const k = monthKey(t.txn_date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return [...map.entries()];
  }, [filtered]);

  const net = useMemo(
    () => filtered.reduce((a, t) => a + (t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0), 0),
    [filtered]
  );

  const hasFilters = type !== "all" || month !== "all" || query !== "";

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={
          loading ? "Loading…" : (
            <>
              {filtered.length} {filtered.length === 1 ? "transaction" : "transactions"}
              {type !== "investment" && (
                <>
                  {" · Net "}
                  <span className={`tabular ${net >= 0 ? "text-sys-green" : "text-label"}`}>{formatINR(net, { sign: net > 0 })}</span>
                </>
              )}
            </>
          )
        }
        actions={
          <>
            <button onClick={openExport} className="btn-secondary">
              <Download className="h-4 w-4" /> Export
            </button>
            <button onClick={openAdd} className="btn-primary hidden md:inline-flex">
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Add
            </button>
          </>
        }
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Segmented options={FILTERS} value={type} onChange={setType} ariaLabel="Filter by type" className="lg:w-[380px] lg:shrink-0" />
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-label-3" />
          <input
            type="search"
            className="field pl-10 pr-10"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search transactions"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-surface-3 text-label-2"
            >
              <X className="h-3 w-3" strokeWidth={3} />
            </button>
          )}
        </div>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="select lg:w-44 lg:shrink-0" aria-label="Month">
          <option value="all">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card animate-pulse space-y-px p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-surface-2/60" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <p className="text-[17px] font-semibold">{hasFilters ? "No results" : "No transactions yet"}</p>
          <p className="caption mt-1">{hasFilters ? "Try a different search or filter." : "Tap + to add your first one."}</p>
          {hasFilters && (
            <button
              onClick={() => {
                setType("all");
                setMonth("all");
                setQuery("");
              }}
              className="btn-plain mt-4"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-7">
          {groups.map(([key, items]) => (
            <section key={key}>
              <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{monthTitle(key)}</h2>
                <GroupSummary items={items} type={type} />
              </div>
              <div className="card px-2 sm:px-3">
                <TransactionList items={items} />
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function GroupSummary({ items, type }: { items: Transaction[]; type: Filter }) {
  const sum = (k: TxnType) => items.filter((t) => t.type === k).reduce((a, t) => a + t.amount, 0);
  const text =
    type === "income"
      ? `Earned ${formatINR(sum("income"))}`
      : type === "investment"
        ? `Net ${formatINR(sum("investment"))}`
        : `Spent ${formatINR(sum("expense"))}`;
  return <span className="tabular shrink-0 text-[13px] text-label-2">{text}</span>;
}
