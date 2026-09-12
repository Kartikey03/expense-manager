"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { NewTransaction, Transaction } from "@/lib/types";
import { toast } from "sonner";

interface Ctx {
  txns: Transaction[];
  loading: boolean;
  userId: string;
  addTxn: (t: NewTransaction) => Promise<void>;
  updateTxn: (id: number, t: NewTransaction) => Promise<void>;
  deleteTxn: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const TxnContext = createContext<Ctx | null>(null);

export function useTxns() {
  const ctx = useContext(TxnContext);
  if (!ctx) throw new Error("useTxns must be used within TransactionsProvider");
  return ctx;
}

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

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("txn_date", { ascending: false })
      .order("id", { ascending: false });
    if (error) {
      toast.error("Could not load transactions");
      setLoading(false);
      return;
    }
    setTxns((data ?? []) as Transaction[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
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
      setTxns((prev) =>
        [data as Transaction, ...prev].sort((a, b) =>
          b.txn_date.localeCompare(a.txn_date)
        )
      );
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
      setTxns((prev) =>
        prev
          .map((x) => (x.id === id ? (data as Transaction) : x))
          .sort((a, b) => b.txn_date.localeCompare(a.txn_date))
      );
      toast.success("Transaction updated");
    },
    [supabase]
  );

  const deleteTxn = useCallback(
    async (id: number) => {
      const prev = txns;
      setTxns((p) => p.filter((x) => x.id !== id)); // optimistic
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) {
        setTxns(prev);
        toast.error(error.message);
        throw error;
      }
      toast.success("Transaction deleted");
    },
    [supabase, txns]
  );

  const value: Ctx = {
    txns,
    loading,
    userId,
    addTxn,
    updateTxn,
    deleteTxn,
    refresh,
  };

  return <TxnContext.Provider value={value}>{children}</TxnContext.Provider>;
}
