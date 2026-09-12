"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Plus,
  LogOut,
  Sparkles,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TransactionsProvider } from "./TransactionsProvider";
import { TransactionModal } from "./TransactionModal";
import type { Transaction } from "@/lib/types";

interface UICtx {
  openAdd: () => void;
  openEdit: (t: Transaction) => void;
}
const UIContext = createContext<UICtx | null>(null);
export function useUI() {
  const c = useContext(UIContext);
  if (!c) throw new Error("useUI outside provider");
  return c;
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/investments", label: "Investments", icon: TrendingUp },
];

export function AppShell({
  userId,
  email,
  children,
}: {
  userId: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(t: Transaction) {
    setEditing(t);
    setModalOpen(true);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <TransactionsProvider userId={userId}>
      <UIContext.Provider value={{ openAdd, openEdit }}>
        <div className="flex min-h-screen">
          {/* Sidebar (desktop) */}
          <aside className="sticky top-0 hidden h-screen w-64 flex-col gap-2 p-4 md:flex">
            <div className="glass mb-2 flex items-center gap-3 rounded-2xl p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Expense</p>
                <p className="text-xs text-white/45">Manager</p>
              </div>
            </div>

            <nav className="glass flex flex-1 flex-col gap-1 rounded-2xl p-3">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {active && (
                      <motion.div
                        layoutId="navactive"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/30 to-accent-violet/20 ring-1 ring-brand-400/40"
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                      />
                    )}
                    <Icon className="relative z-10 h-[18px] w-[18px]" />
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}

              <button
                onClick={openAdd}
                className="btn-primary mt-2 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add transaction
              </button>

              <div className="flex-1" />

              <div className="rounded-xl border border-white/10 p-3">
                <p className="truncate text-xs text-white/50">{email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 text-xs text-white/60 transition-colors hover:text-white"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 text-xs text-white/60 transition-colors hover:text-accent-red"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10">
            {/* Mobile top bar */}
            <div className="mb-4 flex items-center justify-between md:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">Expense Manager</span>
              </div>
              <button onClick={signOut} className="btn-ghost px-2.5 py-1.5">
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="mx-auto max-w-6xl">{children}</div>
          </main>

          {/* Mobile bottom nav */}
          <nav className="glass fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl px-2 py-2 md:hidden">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center rounded-xl px-4 py-1.5 text-[10px] ${
                    active ? "text-brand-300" : "text-white/55"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={openAdd}
              className="ml-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet text-white"
            >
              <Plus className="h-5 w-5" />
            </button>
          </nav>
        </div>

        <TransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editing={editing}
        />
      </UIContext.Provider>
    </TransactionsProvider>
  );
}
