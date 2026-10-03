"use client";

import type { ReactNode } from "react";

/** iOS-style segmented control. The thumb slides with a CSS transform only. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = "",
  ariaLabel,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const n = options.length;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`relative grid rounded-[9px] bg-[rgba(118,118,128,0.24)] p-[2px] ${className}`}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute bottom-[2px] left-[2px] top-[2px] rounded-[7px] bg-[#636366] shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-ios"
        style={{ width: `calc((100% - 4px) / ${n})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={`relative z-10 truncate rounded-[7px] px-2.5 py-[6px] text-[13px] font-medium transition-colors ${
            o.value === value ? "text-white" : "text-label-2 hover:text-label"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
