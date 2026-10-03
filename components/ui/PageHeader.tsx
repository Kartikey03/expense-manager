import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[40px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-label-2 sm:text-[17px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h2>
        {hint && <p className="caption mt-0.5">{hint}</p>}
      </div>
      {/* shrink-0: on narrow screens the action (e.g. a legend) wraps below
          the title instead of squeezing it. */}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
