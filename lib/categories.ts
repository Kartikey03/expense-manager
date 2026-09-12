import type { TxnType } from "./types";

export const CATEGORIES: Record<TxnType, string[]> = {
  expense: [
    "Food & Snacks",
    "Family",
    "Subscriptions",
    "Health & Fitness",
    "Entertainment",
    "Gifts",
    "Shopping & Gadgets",
    "Investment Charges",
    "Travel",
    "Miscellaneous",
  ],
  income: [
    "Salary — Infatix",
    "Salary — Digital Heroes",
    "Salary — NIOT",
    "Freelance",
    "Other Income",
  ],
  investment: [
    "Mutual Funds",
    "Liquid Funds",
    "Gold / ETF",
    "Crypto",
    "Smallcase",
    "Withdrawal",
    "Other",
  ],
};

// Consistent color per category for charts/badges.
export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Snacks": "#fb7185",
  Family: "#f472b6",
  Subscriptions: "#a78bfa",
  "Health & Fitness": "#34d399",
  Entertainment: "#38bdf8",
  Gifts: "#fbbf24",
  "Shopping & Gadgets": "#22d3ee",
  "Investment Charges": "#94a3b8",
  Travel: "#f59e0b",
  Miscellaneous: "#cbd5e1",
  "Salary — Infatix": "#6366f1",
  "Salary — Digital Heroes": "#8b5cf6",
  "Salary — NIOT": "#0ea5e9",
  Freelance: "#2dd4bf",
  "Other Income": "#4ade80",
  "Mutual Funds": "#818cf8",
  "Liquid Funds": "#38bdf8",
  "Gold / ETF": "#fbbf24",
  Crypto: "#f59e0b",
  Smallcase: "#2dd4bf",
  Withdrawal: "#fb7185",
  Other: "#cbd5e1",
};

export function catColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#a5b4fc";
}

export const TYPE_META: Record<TxnType, { label: string; color: string; emoji: string }> = {
  income: { label: "Income", color: "#34d399", emoji: "💰" },
  expense: { label: "Expense", color: "#fb7185", emoji: "🧾" },
  investment: { label: "Investment", color: "#818cf8", emoji: "📈" },
};
