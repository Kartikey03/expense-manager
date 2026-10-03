"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  ChartPie,
  Download,
  LayoutGrid,
  LogOut,
  Plus,
  Settings,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/lib/types";
import { TransactionsProvider } from "./TransactionsProvider";
import { TransactionSheet } from "./TransactionSheet";
import { ExportSheet } from "./ExportSheet";

interface UICtx {
  email: string;
  openAdd: () => void;
  openEdit: (t: Transaction) => void;
  openExport: () => void;
  signOut: () => Promise<void>;
}
const UIContext = createContext<UICtx | null>(null);
export function useUI() {
  const c = useContext(UIContext);
  if (!c) throw new Error("useUI must be used within AppShell");
  return c;
}

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/investments", label: "Investments", icon: ChartPie },
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
  const [sheet, setSheet] = useState<null | "txn" | "export">(null);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const openAdd = useCallback(() => {
    setEditing(null);
    setSheet("txn");
  }, []);
  const openEdit = useCallback((t: Transaction) => {
    setEditing(t);
    setSheet("txn");
  }, []);
  const openExport = useCallback(() => setSheet("export"), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const signOut = useCallback(async () => {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }, [router]);

  const ui = useMemo(
    () => ({ email, openAdd, openEdit, openExport, signOut }),
    [email, openAdd, openEdit, openExport, signOut]
  );

  return (
    <TransactionsProvider userId={userId}>
      <UIContext.Provider value={ui}>
        {/* Desktop: translucent top bar, Apple.com style */}
        <header className="sticky top-0 z-40 hidden border-b border-hairline bg-black/75 backdrop-blur-xl backdrop-saturate-150 md:block">
          <div className="mx-auto flex h-[52px] max-w-[1080px] items-center gap-6 px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-sys-blue">
                <Wallet className="h-4 w-4 text-white" strokeWidth={2.25} />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.01em]">Expense Manager</span>
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-1.5 text-[14px] transition-colors ${
                      active ? "bg-surface-2 text-label" : "text-label-2 hover:text-label"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={openAdd} className="btn-primary h-8 px-3.5 text-[13px]">
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Add
              </button>
              <AccountMenu email={email} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 md:pb-20 md:pt-10">
          <div key={pathname} className="enter">
            {children}
          </div>
        </main>

        {/* Mobile: iOS tab bar */}
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-[rgba(22,22,23,0.88)] backdrop-blur-xl backdrop-saturate-150 md:hidden">
          <div className="mx-auto grid h-14 max-w-md grid-cols-5 items-center">
            <TabLink {...NAV[0]} active={pathname === NAV[0].href} />
            <TabLink {...NAV[1]} active={pathname === NAV[1].href} />
            <div className="flex justify-center">
              <button
                onClick={openAdd}
                aria-label="Add transaction"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white transition-opacity active:opacity-75"
              >
                <Plus className="h-[22px] w-[22px]" strokeWidth={2.5} />
              </button>
            </div>
            <TabLink {...NAV[2]} active={pathname === NAV[2].href} />
            <TabLink href="/settings" label="Settings" icon={Settings} active={pathname === "/settings"} />
          </div>
        </nav>

        <TransactionSheet open={sheet === "txn"} onClose={closeSheet} editing={editing} />
        <ExportSheet open={sheet === "export"} onClose={closeSheet} />
      </UIContext.Provider>
    </TransactionsProvider>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Wallet;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
        active ? "text-sys-blue" : "text-sys-gray"
      }`}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.9} />
      {label}
    </Link>
  );
}

function AccountMenu({ email }: { email: string }) {
  const { openExport, signOut } = useUI();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors hover:bg-white/[0.06]";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-[13px] font-semibold uppercase text-label transition-opacity hover:opacity-85"
      >
        {email.charAt(0) || "?"}
      </button>
      {open && (
        <div className="enter absolute right-0 top-11 w-60 rounded-xl bg-surface-2 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <p className="truncate px-2.5 pb-2 pt-1.5 text-[12px] text-label-2">{email}</p>
          <div className="mb-1 h-px bg-hairline" />
          <Link href="/settings" className={item}>
            <Settings className="h-4 w-4 text-label-2" /> Settings
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              openExport();
            }}
            className={item}
          >
            <Download className="h-4 w-4 text-label-2" /> Export CSV
          </button>
          <div className="my-1 h-px bg-hairline" />
          <button onClick={signOut} className={`${item} text-sys-red`}>
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
