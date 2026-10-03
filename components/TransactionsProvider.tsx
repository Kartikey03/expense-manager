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
  addTxn: (t: NewTransaction) => void;
  updateTxn: (id: number, t: NewTransaction) => void;
  deleteTxn: (id: number) => void;
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

// Supabase can return numeric columns as strings.
const normalize = (t: Transaction): Transaction => ({ ...t, amount: Number(t.amount) });

const STALE_MS = 60_000;
export const CACHE_KEY = "em:txns:v1";

type Cache = { uid: string; txns: Transaction[] };

function readCache(uid: string): Transaction[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cache;
    return c.uid === uid && Array.isArray(c.txns) ? c.txns : null;
  } catch {
    return null;
  }
}

function writeCache(uid: string, txns: Transaction[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ uid, txns } satisfies Cache));
  } catch {
    /* storage full or blocked — cache is best-effort */
  }
}

let tempId = -1;

/**
 * Holds every transaction in memory for instant filtering/navigation.
 *
 * - Shows the on-device cache immediately, then revalidates from Supabase.
 * - Writes are optimistic: the list updates at once; the confirmation toast
 *   appears when the database accepts it, or the change rolls back with a
 *   Retry toast if it doesn't.
 */
export function TransactionsProvider({ uid, children }: { uid: string | null; children: React.ReactNode }) {
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

  // Hydrate from cache, then fetch fresh data.
  useEffect(() => {
    if (!uid) return;
    const cached = readCache(uid);
    if (cached) {
      setTxns(cached);
      setLoading(false);
    }
    refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetch.current > STALE_MS) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [uid, refresh]);

  // Keep the cache in sync with confirmed state (skip optimistic temp rows).
  useEffect(() => {
    if (uid && !loading) writeCache(uid, txns.filter((t) => t.id > 0));
  }, [uid, loading, txns]);

  const addTxn = useCallback(
    (t: NewTransaction) => {
      if (!uid) return;
      const now = new Date().toISOString();
      const temp: Transaction = { ...t, source: t.source ?? null, id: tempId--, user_id: uid, created_at: now, updated_at: now };
      setTxns((prev) => [temp, ...prev].sort(byNewest));
      (async () => {
        const { data, error } = await supabase.from("transactions").insert({ ...t, user_id: uid }).select().single();
        if (error) {
          setTxns((prev) => prev.filter((x) => x.id !== temp.id));
          toast.error(`Couldn't save: ${error.message}`, { action: { label: "Retry", onClick: () => addTxn(t) } });
          return;
        }
        const saved = normalize(data as Transaction);
        setTxns((prev) => prev.map((x) => (x.id === temp.id ? saved : x)).sort(byNewest));
        toast.success("Transaction added");
      })();
    },
    [supabase, uid]
  );

  const updateTxn = useCallback(
    (id: number, t: NewTransaction) => {
      if (id < 0) return void toast("Still saving — try again in a moment");
      let previous: Transaction | undefined;
      setTxns((prev) => {
        previous = prev.find((x) => x.id === id);
        return prev.map((x) => (x.id === id ? { ...x, ...t, source: t.source ?? null } : x)).sort(byNewest);
      });
      (async () => {
        const { data, error } = await supabase.from("transactions").update(t).eq("id", id).select().single();
        if (error) {
          if (previous) setTxns((prev) => prev.map((x) => (x.id === id ? previous! : x)).sort(byNewest));
          toast.error(`Couldn't update: ${error.message}`, { action: { label: "Retry", onClick: () => updateTxn(id, t) } });
          return;
        }
        const saved = normalize(data as Transaction);
        setTxns((prev) => prev.map((x) => (x.id === id ? saved : x)));
        toast.success("Transaction updated");
      })();
    },
    [supabase]
  );

  const deleteTxn = useCallback(
    (id: number) => {
      if (id < 0) return void toast("Still saving — try again in a moment");
      let removed: Transaction | undefined;
      setTxns((prev) => {
        removed = prev.find((x) => x.id === id);
        return prev.filter((x) => x.id !== id);
      });
      (async () => {
        const { error } = await supabase.from("transactions").delete().eq("id", id);
        if (error) {
          if (removed) setTxns((prev) => [removed!, ...prev].sort(byNewest));
          toast.error(`Couldn't delete: ${error.message}`, { action: { label: "Retry", onClick: () => deleteTxn(id) } });
          return;
        }
        toast.success("Transaction deleted");
      })();
    },
    [supabase]
  );

  const value = useMemo(
    () => ({ txns, loading, addTxn, updateTxn, deleteTxn }),
    [txns, loading, addTxn, updateTxn, deleteTxn]
  );

  return <TxnContext.Provider value={value}>{children}</TxnContext.Provider>;
}
