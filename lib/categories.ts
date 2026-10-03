import {
  ArrowDownToLine,
  Bitcoin,
  Briefcase,
  CircleDot,
  Clapperboard,
  Coins,
  Droplets,
  Dumbbell,
  Ellipsis,
  Gift,
  Heart,
  Laptop,
  Layers,
  PieChart,
  Plane,
  Receipt,
  Repeat,
  ShoppingBag,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
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

// iOS dark-mode system colors — flat, no gradients.
const C = {
  blue: "#0a84ff",
  green: "#30d158",
  red: "#ff453a",
  orange: "#ff9f0a",
  yellow: "#ffd60a",
  indigo: "#5e5ce6",
  purple: "#bf5af2",
  pink: "#ff375f",
  teal: "#40c8e0",
  cyan: "#64d2ff",
  mint: "#63e6e2",
  brown: "#ac8e68",
  gray: "#8e8e93",
  gray2: "#636366",
};

const META: Record<string, { color: string; icon: LucideIcon }> = {
  // Expense
  "Food & Snacks": { color: C.orange, icon: UtensilsCrossed },
  Family: { color: C.pink, icon: Heart },
  Subscriptions: { color: C.purple, icon: Repeat },
  "Health & Fitness": { color: C.green, icon: Dumbbell },
  Entertainment: { color: C.cyan, icon: Clapperboard },
  Gifts: { color: C.yellow, icon: Gift },
  "Shopping & Gadgets": { color: C.teal, icon: ShoppingBag },
  "Investment Charges": { color: C.gray, icon: Receipt },
  Travel: { color: C.brown, icon: Plane },
  Miscellaneous: { color: C.gray2, icon: Ellipsis },
  // Income
  "Salary — Infatix": { color: C.blue, icon: Briefcase },
  "Salary — Digital Heroes": { color: C.indigo, icon: Briefcase },
  "Salary — NIOT": { color: C.teal, icon: Briefcase },
  Freelance: { color: C.green, icon: Laptop },
  "Other Income": { color: C.mint, icon: Wallet },
  // Investment
  "Mutual Funds": { color: C.indigo, icon: PieChart },
  "Liquid Funds": { color: C.cyan, icon: Droplets },
  "Gold / ETF": { color: C.yellow, icon: Coins },
  Crypto: { color: C.orange, icon: Bitcoin },
  Smallcase: { color: C.mint, icon: Layers },
  Withdrawal: { color: C.red, icon: ArrowDownToLine },
  Other: { color: C.gray, icon: CircleDot },
};

export function catColor(cat: string) {
  return META[cat]?.color ?? C.gray;
}

export function catIcon(cat: string): LucideIcon {
  return META[cat]?.icon ?? CircleDot;
}

export const TYPE_META: Record<TxnType, { label: string; plural: string; color: string }> = {
  expense: { label: "Expense", plural: "Expenses", color: C.red },
  income: { label: "Income", plural: "Income", color: C.green },
  investment: { label: "Investment", plural: "Investments", color: C.blue },
};
