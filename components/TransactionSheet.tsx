"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { NewTransaction, Transaction, TxnType } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { todayISO } from "@/lib/format";
import { useTxns } from "./TransactionsProvider";
import { Sheet } from "./ui/Sheet";
import { Segmented } from "./ui/Segmented";

const TYPES: { value: TxnType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "investment", label: "Investment" },
];

type Direction = "buy" | "withdraw";

/** Digits and a single dot, max 2 decimals, max 9 integer digits. */
function sanitizeAmount(v: string) {
  const cleaned = v.replace(/[^0-9.]/g, "");
  const [int, ...rest] = cleaned.split(".");
  const intPart = int.slice(0, 9);
  return rest.length ? `${intPart}.${rest.join("").slice(0, 2)}` : intPart;
}

export function TransactionSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Transaction | null;
}) {
  const { addTxn, updateTxn, deleteTxn } = useTxns();
  const [type, setType] = useState<TxnType>("expense");
  const [direction, setDirection] = useState<Direction>("buy");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [note, setNote] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);

  // Reset only when the sheet opens, so the form doesn't flash while closing.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setDirection(editing.amount < 0 ? "withdraw" : "buy");
      setAmount(String(Math.abs(editing.amount)));
      setDate(editing.txn_date);
      setCategory(editing.category);
      setNote(editing.description);
    } else {
      setType("expense");
      setDirection("buy");
      setAmount("");
      setDate(todayISO());
      setCategory(CATEGORIES.expense[0]);
      setNote("");
    }
    // Focus after the open transition starts (desktop keyboards benefit most).
    const t = window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 260);
    return () => window.clearTimeout(t);
  }, [open, editing]);

  function changeType(t: TxnType) {
    setType(t);
    if (!CATEGORIES[t].includes(category)) setCategory(CATEGORIES[t][0]);
  }

  const parsed = parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed > 0 && !!date;

  // Writes are optimistic (see TransactionsProvider): the list updates and the
  // sheet closes immediately; failures roll back with a Retry toast.
  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const signed = type === "investment" && direction === "withdraw" ? -parsed : parsed;
    const payload: NewTransaction = {
      type,
      amount: Math.round(signed * 100) / 100,
      txn_date: date,
      description: note.trim(),
      category,
      source: type === "expense" ? null : category,
    };
    if (editing) updateTxn(editing.id, payload);
    else addTxn(payload);
    onClose();
  }

  function remove() {
    if (!editing) return;
    deleteTxn(editing.id);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Edit Transaction" : "New Transaction"}>
      <form onSubmit={save} className="space-y-4 pt-1">
        <Segmented options={TYPES} value={type} onChange={changeType} ariaLabel="Transaction type" />

        {/* Amount */}
        <div className="rounded-2xl bg-surface-2 px-4 py-5 text-center">
          <label htmlFor="amount" className="caption">
            Amount
          </label>
          <div className="mt-1 flex items-baseline justify-center gap-0.5 overflow-hidden">
            <span className="text-[28px] font-semibold text-label-2">₹</span>
            <input
              ref={amountRef}
              id="amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
              style={{ width: `${Math.max(1, amount.length) + 0.6}ch` }}
              className="tabular min-w-0 max-w-full bg-transparent text-left text-[40px] font-semibold leading-tight tracking-[-0.02em] outline-none placeholder:text-label-3"
              required
            />
          </div>
        </div>

        {type === "investment" && (
          <Segmented
            options={[
              { value: "buy", label: "Invest" },
              { value: "withdraw", label: "Withdraw" },
            ]}
            value={direction}
            onChange={setDirection}
            ariaLabel="Investment direction"
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className="caption mb-1.5 block">
              Date
            </label>
            <input id="date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="category" className="caption mb-1.5 block">
              {type === "income" ? "Source" : "Category"}
            </label>
            <select id="category" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES[type].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="note" className="caption mb-1.5 block">
            Note
          </label>
          <input
            id="note"
            className="field"
            placeholder={type === "expense" ? "What was it for?" : type === "income" ? "e.g. Infatix salary" : "e.g. Nifty 50 MF"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center">
          {editing && (
            <button type="button" onClick={remove} className="btn-danger btn-lg sm:mr-auto sm:h-9 sm:rounded-full sm:text-[14px]">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`btn-secondary btn-lg hidden sm:inline-flex sm:h-9 sm:rounded-full sm:text-[14px] ${editing ? "" : "sm:ml-auto"}`}
          >
            Cancel
          </button>
          <button type="submit" disabled={!valid} className="btn-primary btn-lg sm:h-9 sm:rounded-full sm:text-[14px]">
            {editing ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
