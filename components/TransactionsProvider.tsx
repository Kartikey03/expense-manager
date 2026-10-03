"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { NewTransaction, Transaction } from "@/lib/types";

interface Ctx {
  txns: Transaction[];
  loading: boolean;
  addTxn: (t: NewTransaction) => Promise<void>;
  updateTxn: (id: number, t: NewTransaction) => Promise<void>;
  deleteTxn: (id: number) => Promise<void>;
}

const TxnContext = createContext<Ctx | null>(null);

export function useTxns() {
  const ctx = useContext(TxnContext);
  if (!ctx) throw new Error("useTxns must be used within TransactionsProvider");
  return ctx;
}

// Newest first; stable for same-day entries.
const byNewest = (a: Transaction, b: Transaction) =>
  b.txn_date.localeCompare(a.txn_date) || b.id - a.id;

// Supabase returns numeric columns as strings in some configurations.
const normalize = (t: Transaction): Transaction => ({ ...t, amount: Number(t.amount) });

const STALE_MS = 60_000;

export function TransactionsProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const lastFetch = useRef(0);

  const refresh = useCallback(async () => {
    lastFetch.current = Date.now();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("txn_date", { ascending: false })
      .order("id", { ascending: false });
    if (error) toast.error("Couldn't load transactions");
    else setTxns((data ?? []).map((t) => normalize(t as Transaction)));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
    // Pick up changes made on another device when you come back to the tab.
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetch.current > STALE_MS) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const addTxn = useCallback(
    async (t: NewTransaction) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...t, user_id: userId })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      setTxns((prev) => [normalize(data as Transaction), ...prev].sort(byNewest));
      toast.success("Transaction added");
    },
    [supabase, userId]
  );

  const updateTxn = useCallback(
    async (id: number, t: NewTransaction) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(t)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      const next = normalize(data as Transaction);
      setTxns((prev) => prev.map((x) => (x.id === id ? next : x)).sort(byNewest));
      toast.success("Transaction updated");
    },
    [supabase]
  );

  const deleteTxn = useCallback(
    async (id: number) => {
      let removed: Transaction | undefined;
      setTxns((prev) => {
        removed = prev.find((x) => x.id === id);
        return prev.filter((x) => x.id !== id);
      });
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) {
        if (removed) setTxns((prev) => [removed!, ...prev].sort(byNewest));
        toast.error(error.message);
        throw error;
      }
      toast.success("Transaction deleted");
    },
    [supabase]
  );

  const value = useMemo(
    () => ({ txns, loading, addTxn, updateTxn, deleteTxn }),
    [txns, loading, addTxn, updateTxn, deleteTxn]
  );

  return <TxnContext.Provider value={value}>{children}</TxnContext.Provider>;
}
