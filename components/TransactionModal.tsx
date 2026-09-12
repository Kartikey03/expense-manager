"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Trash2 } from "lucide-react";
import type { NewTransaction, Transaction, TxnType } from "@/lib/types";
import { CATEGORIES, TYPE_META } from "@/lib/categories";
import { useTxns } from "./TransactionsProvider";

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionModal({
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
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setDate(editing.txn_date);
      setDescription(editing.description);
      setCategory(editing.category);
    } else {
      setType("expense");
      setAmount("");
      setDate(today());
      setDescription("");
      setCategory(CATEGORIES.expense[0]);
    }
  }, [editing, open]);

  function changeType(t: TxnType) {
    setType(t);
    if (!CATEGORIES[t].includes(category)) setCategory(CATEGORIES[t][0]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt)) return;
    const payload: NewTransaction = {
      type,
      amount: amt,
      txn_date: date,
      description: description.trim(),
      category,
      source: type === "expense" ? null : category,
    };
    setSaving(true);
    try {
      if (editing) await updateTxn(editing.id, payload);
      else await addTxn(payload);
      onClose();
    } catch {
      /* toast handled in provider */
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!editing) return;
    setSaving(true);
    try {
      await deleteTxn(editing.id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="glass relative z-10 w-full max-w-lg rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit transaction" : "Add transaction"}
              </h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={save} className="mt-5 space-y-4">
              {/* Type segmented control */}
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1">
                {(Object.keys(TYPE_META) as TxnType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => changeType(t)}
                    className="relative rounded-lg py-2 text-sm font-medium transition-colors"
                  >
                    {type === t && (
                      <motion.div
                        layoutId="typeseg"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: `${TYPE_META[t].color}33`, border: `1px solid ${TYPE_META[t].color}` }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10" style={{ color: type === t ? TYPE_META[t].color : undefined }}>
                      {TYPE_META[t].emoji} {TYPE_META[t].label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Amount (₹)</label>
                  <input
                    className="glass-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Date</label>
                  <input
                    className="glass-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/50">
                  {type === "income" ? "Source" : "Category"}
                </label>
                <select
                  className="glass-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES[type].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/50">Description</label>
                <input
                  className="glass-input"
                  placeholder={type === "expense" ? "e.g. lava cake" : type === "income" ? "e.g. Infatix salary" : "e.g. Nifty 50 MF"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {type === "investment" && (
                <p className="text-xs text-white/40">
                  Tip: use a <span className="text-accent-red">negative</span> amount to log a withdrawal.
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                {editing && (
                  <button
                    type="button"
                    onClick={remove}
                    disabled={saving}
                    className="btn-ghost flex items-center gap-2 text-accent-red"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                )}
                <div className="flex-1" />
                <button type="button" onClick={onClose} className="btn-ghost">
                  Cancel
                </button>
                <button disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
