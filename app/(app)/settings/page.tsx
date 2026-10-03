"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/components/AppShell";
import { useTxns } from "@/components/TransactionsProvider";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  const { email, openExport, signOut } = useUI();
  const { txns, loading } = useTxns();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Use at least 6 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(error.message);
    setPassword("");
    setConfirm("");
    toast.success("Password saved");
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <PageHeader title="Settings" />

      <div className="space-y-8">
        <Group title="Account">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[17px] font-semibold uppercase">
              {email.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px]">{email}</p>
              <p className="text-[13px] text-label-2">Signed in with email</p>
            </div>
          </div>
        </Group>

        <Group title="Password" footer="Optional. Lets you sign in without waiting for a magic link.">
          <form onSubmit={savePassword} className="space-y-3 p-4">
            <input
              className="field bg-surface-3/60"
              type="password"
              placeholder="New password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="field bg-surface-3/60"
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button disabled={saving || !password} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Password
            </button>
          </form>
        </Group>

        <Group title="Data" footer={loading ? "Loading…" : `${txns.length} transactions on record.`}>
          <button
            onClick={openExport}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-sys-green">
              <Download className="h-[17px] w-[17px] text-white" strokeWidth={2.25} />
            </span>
            <span className="flex-1 text-[15px]">Export CSV</span>
            <ChevronRight className="h-4 w-4 text-label-3" />
          </button>
        </Group>

        <Group>
          <button
            onClick={signOut}
            className="w-full px-4 py-3.5 text-center text-[15px] text-sys-red transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
          >
            Sign Out
          </button>
        </Group>
      </div>
    </div>
  );
}

function Group({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  return (
    <section>
      {title && <h2 className="caption mb-2 px-4">{title}</h2>}
      <div className="card overflow-hidden">{children}</div>
      {footer && <p className="caption mt-2 px-4">{footer}</p>}
    </section>
  );
}
