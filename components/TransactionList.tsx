"use client";

import { memo } from "react";
import type { Transaction } from "@/lib/types";
import { catColor, catIcon } from "@/lib/categories";
import { formatINR, shortDate } from "@/lib/format";
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
    return <p className="py-10 text-center text-[15px] text-label-2">{emptyLabel}</p>;
  }

  return (
    <ul>
      {items.map((t) => (
        <Row key={t.id} t={t} onOpen={openEdit} />
      ))}
    </ul>
  );
}

// Memoised so adding/removing one transaction doesn't re-render every row.
const Row = memo(function Row({ t, onOpen }: { t: Transaction; onOpen: (t: Transaction) => void }) {
  const color = catColor(t.category);
  const Icon = catIcon(t.category);
  const title = t.description || t.category;

  let amountText: string;
  let amountClass = "text-label";
  if (t.type === "income") {
    amountText = formatINR(t.amount, { sign: true });
    amountClass = "text-sys-green";
  } else if (t.type === "expense") {
    amountText = formatINR(-t.amount);
  } else if (t.amount < 0) {
    amountText = formatINR(t.amount);
    amountClass = "text-sys-orange";
  } else {
    amountText = formatINR(t.amount);
  }

  return (
    <li className="group">
      <button
        type="button"
        onClick={() => onOpen(t)}
        className="flex w-full items-center gap-3 rounded-none pl-1 text-left transition-colors hover:bg-white/[0.035] active:bg-white/[0.06] sm:pl-2"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: `${color}26`, color }}
        >
          <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-3 border-b border-hairline py-3 pr-1 group-last:border-0 sm:pr-2">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] leading-snug">{title}</span>
            <span className="block truncate text-[13px] leading-snug text-label-2">
              {t.description ? `${t.category} · ` : ""}
              {shortDate(t.txn_date)}
            </span>
          </span>
          <span className={`tabular shrink-0 text-[15px] font-medium ${amountClass}`}>{amountText}</span>
        </span>
      </button>
    </li>
  );
});
