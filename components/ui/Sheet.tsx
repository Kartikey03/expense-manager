"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

const EXIT_MS = 240;

/**
 * Bottom sheet on mobile, centered dialog on desktop.
 *
 * Built on plain CSS transitions instead of an animation library so it can
 * never get stuck half-closed: the moment `open` turns false the layer
 * becomes `pointer-events-none` (clicks pass straight through to the page),
 * and reopening mid-exit simply cancels the pending unmount.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames: let the closed state paint first so the transition runs.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  // Escape to close + lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 ${
        visible ? "" : "pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[20px] bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-[240ms] ease-ios sm:max-w-[440px] sm:rounded-[20px] ${
          visible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-100 sm:translate-y-0 sm:scale-[0.97] sm:opacity-0"
        }`}
      >
        {/* Grabber (mobile) */}
        <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-surface-3 sm:hidden" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3 sm:pt-5">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-label-2 transition-colors hover:text-label"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}
