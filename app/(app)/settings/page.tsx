"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Use at least 6 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(error.message);
    setPassword("");
    setConfirm("");
    toast.success("Password set — you can now sign in with it ✨");
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-white/45">Manage how you sign in.</p>
      </div>

      <GlassCard className="max-w-lg p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Set a password</h3>
            <p className="text-xs text-white/45">
              Optional — so you don't need a magic link every time.
            </p>
          </div>
        </div>

        <form onSubmit={savePassword} className="space-y-3">
          <input
            className="glass-input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="glass-input"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Save password
          </button>
        </form>
      </GlassCard>

      <GlassCard className="max-w-lg p-6">
        <h3 className="text-sm font-semibold">Session</h3>
        <p className="mt-1 text-xs text-white/45">Sign out of this device.</p>
        <button onClick={signOut} className="btn-ghost mt-3 flex items-center gap-2 text-accent-red">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </GlassCard>
    </div>
  );
}
