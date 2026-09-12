"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Loader2, Sparkles, ArrowRight } from "lucide-react";

type Mode = "magic" | "password";

export default function LoginPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Magic link sent — check your inbox ✨");
  }

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass w-full max-w-md rounded-3xl p-8"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 180 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-violet shadow-glow"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>

        <h1 className="text-center text-2xl font-bold tracking-tight">
          Expense Manager
        </h1>
        <p className="mt-1 text-center text-sm text-white/50">
          Your money, beautifully in view.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
          {(["magic", "password"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setSent(false);
              }}
              className="relative rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              {mode === m && (
                <motion.div
                  layoutId="authtab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-500/80 to-accent-violet/80"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {m === "magic" ? "Magic Link" : "Password"}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === "magic" ? (
            <motion.form
              key="magic"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              onSubmit={sendMagicLink}
              className="mt-6 space-y-4"
            >
              {sent ? (
                <div className="rounded-2xl border border-accent-green/30 bg-accent-green/10 p-5 text-center">
                  <Mail className="mx-auto h-8 w-8 text-accent-green" />
                  <p className="mt-2 text-sm">
                    Link sent to <span className="font-semibold">{email}</span>.
                    Open it on this device to sign in.
                  </p>
                </div>
              ) : (
                <>
                  <Field
                    icon={<Mail className="h-4 w-4" />}
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={setEmail}
                  />
                  <button disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send magic link <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </>
              )}
            </motion.form>
          ) : (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              onSubmit={signInPassword}
              className="mt-6 space-y-4"
            >
              <Field
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={setEmail}
              />
              <Field
                icon={<Lock className="h-4 w-4" />}
                type="password"
                placeholder="Password"
                value={password}
                onChange={setPassword}
              />
              <button disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
              </button>
              <p className="text-center text-xs text-white/40">
                No password yet? Use the Magic Link tab, then set one from Settings.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
        {icon}
      </span>
      <input
        className="glass-input pl-10"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}
