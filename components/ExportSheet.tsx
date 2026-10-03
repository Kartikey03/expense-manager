"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Download } from "lucide-react";
import { toast } from "sonner";
import { useTxns } from "./TransactionsProvider";
import { Sheet } from "./ui/Sheet";
import { Segmented } from "./ui/Segmented";
import {
  RANGES,
  describeRange,
  downloadCSV,
  exportFilename,
  filterForExport,
  toCSV,
  type ExportType,
  type RangeKey,
} from "@/lib/export";
import { formatINR, longDate } from "@/lib/format";

const TYPES: { value: ExportType; label: string }[] = [
  { value: "expense", label: "Expenses" },
  { value: "income", label: "Income" },
  { value: "investment", label: "Invested" },
  { value: "all", label: "All" },
];

export function ExportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { txns } = useTxns();
  const [range, setRange] = useState<RangeKey>("1m");
  const [type, setType] = useState<ExportType>("expense");

  useEffect(() => {
    if (open) {
      setRange("1m");
      setType("expense");
    }
  }, [open]);

  const rows = useMemo(() => filterForExport(txns, range, type), [txns, range, type]);
  const total = useMemo(() => rows.reduce((a, t) => a + t.amount, 0), [rows]);

  function download() {
    if (!rows.length) return;
    downloadCSV(exportFilename(range, type), toCSV(rows));
    toast.success(`Exported ${rows.length} transaction${rows.length === 1 ? "" : "s"}`);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Export CSV">
      <div className="space-y-5 pt-1">
        <section>
          <p className="caption mb-2 px-1">Time range</p>
          <ul className="overflow-hidden rounded-xl bg-surface-2">
            {RANGES.map((r) => {
              const selected = r.key === range;
              return (
                <li key={r.key} className="group">
                  <button
                    type="button"
                    onClick={() => setRange(r.key)}
                    aria-pressed={selected}
                    className="flex w-full items-center gap-3 pl-4 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
                  >
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-3 border-b border-hairline py-3 pr-4 group-last:border-0">
                      <span className="min-w-0">
                        <span className="block text-[15px]">{r.label}</span>
                        <span className="block text-[13px] text-label-2">{describeRange(r.key)}</span>
                      </span>
                      <Check
                        className={`h-[18px] w-[18px] shrink-0 text-sys-blue transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}
                        strokeWidth={2.5}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <p className="caption mb-2 px-1">Include</p>
          <Segmented options={TYPES} value={type} onChange={setType} ariaLabel="Transaction type to export" />
        </section>

        <div className="rounded-xl bg-surface-2 px-4 py-3 text-[14px]">
          {rows.length ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">
                  {rows.length} transaction{rows.length === 1 ? "" : "s"}
                </p>
                <p className="truncate text-[13px] text-label-2">
                  {longDate(rows[0].txn_date)} – {longDate(rows[rows.length - 1].txn_date)}
                </p>
              </div>
              {type !== "all" && <span className="tabular shrink-0 text-[17px] font-semibold">{formatINR(total)}</span>}
            </div>
          ) : (
            <span className="text-label-2">Nothing to export for this selection.</span>
          )}
        </div>

        <button type="button" onClick={download} disabled={!rows.length} className="btn-primary btn-lg w-full">
          <Download className="h-[18px] w-[18px]" />
          Download CSV
        </button>
      </div>
    </Sheet>
  );
}
