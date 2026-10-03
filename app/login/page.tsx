"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Segmented } from "@/components/ui/Segmented";

type Mode = "magic" | "password";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const supabase = createClient();
    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return toast.error(error.message);
      }
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 py-12">
      <div className="enter w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <img
            src="/kiwi-icon.png"
            alt=""
            width={72}
            height={72}
            className="mx-auto mb-5 h-[72px] w-[72px] rounded-[17px] shadow-[0_12px_40px_rgba(124,204,106,0.18)]"
          />
          <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.025em]">Kiwi</h1>
          <p className="mt-1.5 text-[15px] text-label-2">Sign in to see where your money stands.</p>
        </div>

        {sent ? (
          <div className="card px-6 py-8 text-center">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent/15">
              <Mail className="h-5 w-5 text-accent-link" />
            </span>
            <p className="text-[17px] font-semibold">Check your email</p>
            <p className="caption mt-1.5">
              We sent a sign-in link to <span className="text-label">{email}</span>. Open it on this device.
            </p>
            <button onClick={() => setSent(false)} className="btn-plain mt-4">
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Segmented
              options={[
                { value: "magic", label: "Magic Link" },
                { value: "password", label: "Password" },
              ]}
              value={mode}
              onChange={setMode}
              ariaLabel="Sign-in method"
              className="mb-5"
            />
            <input
              className="field h-12"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {mode === "password" && (
              <input
                className="field h-12"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}
            <button disabled={loading} className="btn-primary btn-lg w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "magic" ? "Send Magic Link" : "Sign In"}
            </button>
            <p className="caption pt-2 text-center">
              {mode === "magic"
                ? "We'll email you a one-time link. No password needed."
                : "No password yet? Use Magic Link, then set one in Settings."}
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
