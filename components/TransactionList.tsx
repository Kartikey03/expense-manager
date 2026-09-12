"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/lib/types";
import { catColor, TYPE_META } from "@/lib/categories";
import { formatINR, prettyDate } from "@/lib/format";
import { useUI } from "./AppShell";

export function TransactionList({
  items,
  emptyLabel = "No transactions yet.",
}: {
  items: Transaction[];
  emptyLabel?: string;
}) {
  const { openEdit } = useUI();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-white/40">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/5">
      <AnimatePresence initial={false}>
        {items.map((t, i) => {
          const meta = TYPE_META[t.type];
          const positive = t.type === "income";
          const isWithdraw = t.type === "investment" && t.amount < 0;
          return (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.3) }}
              onClick={() => openEdit(t)}
              className="group flex cursor-pointer items-center gap-3 px-1 py-3 transition-colors hover:bg-white/[0.03]"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm"
                style={{ background: `${meta.color}1f` }}
              >
                {meta.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {t.description || <span className="text-white/40">—</span>}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: `${catColor(t.category)}22`, color: catColor(t.category) }}
                  >
                    {t.category}
                  </span>
                  <span className="text-[11px] text-white/40">{prettyDate(t.txn_date)}</span>
                </div>
              </div>
              <span
                className="shrink-0 text-sm font-semibold tabular-nums"
                style={{
                  color: positive ? "#34d399" : isWithdraw ? "#fbbf24" : t.type === "investment" ? "#a5b4fc" : "#fb7185",
                }}
              >
                {positive ? "+" : t.type === "expense" ? "−" : ""}
                {formatINR(Math.abs(t.amount))}
              </span>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
