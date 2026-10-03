import type { Transaction, TxnType } from "./types";
import { longDate, toISODate } from "./format";

export type RangeKey = "all" | "1m" | "2m" | "3m";
export type ExportType = TxnType | "all";

export const RANGES: { key: RangeKey; label: string; months: number | null }[] = [
  { key: "all", label: "From the start", months: null },
  { key: "1m", label: "Last month", months: 1 },
  { key: "2m", label: "Last 2 months", months: 2 },
  { key: "3m", label: "Last 3 months", months: 3 },
];

/**
 * Start date (inclusive, YYYY-MM-DD) for a rolling window ending today.
 * "Last month" on 4 Oct → from 4 Sep. Day is clamped for short months
 * (31 Mar − 1 month → 28/29 Feb).
 */
export function rangeStart(key: RangeKey, now = new Date()): string | null {
  const months = RANGES.find((r) => r.key === key)?.months;
  if (!months) return null;
  const y = now.getFullYear();
  const m = now.getMonth() - months;
  const lastDay = new Date(y, m + 1, 0).getDate();
  return toISODate(new Date(y, m, Math.min(now.getDate(), lastDay)));
}

export function filterForExport(txns: Transaction[], range: RangeKey, type: ExportType) {
  const start = rangeStart(range);
  return txns
    .filter((t) => (type === "all" || t.type === type) && (!start || t.txn_date >= start))
    .sort((a, b) => a.txn_date.localeCompare(b.txn_date) || a.id - b.id);
}

// Quote fields containing separators, and neutralise leading = + - @ so a
// description can never be interpreted as a spreadsheet formula.
function cell(v: string) {
  let s = v;
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(txns: Transaction[]) {
  const header = ["Date", "Type", "Category", "Description", "Amount (INR)"];
  const rows = txns.map((t) =>
    [
      t.txn_date,
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      cell(t.category),
      cell(t.description),
      t.amount.toFixed(2),
    ].join(",")
  );
  // BOM so Excel opens it as UTF-8 (category names contain "—").
  return "﻿" + [header.join(","), ...rows].join("\r\n") + "\r\n";
}

export function exportFilename(range: RangeKey, type: ExportType) {
  const what = type === "all" ? "transactions" : type === "income" ? "income" : `${type}s`;
  const span = range === "all" ? "all-time" : `last-${range.replace("m", "")}-month${range === "1m" ? "" : "s"}`;
  return `${what}_${span}_${toISODate(new Date())}.csv`;
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function describeRange(range: RangeKey) {
  const start = rangeStart(range);
  if (!start) return "Every transaction on record";
  return `Since ${longDate(start)}`;
}
