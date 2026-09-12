import type { Transaction, TxnType } from "./types";
import { monthKey } from "./format";

export function sumBy(txns: Transaction[], type: TxnType) {
  return txns.filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0);
}

export interface Totals {
  income: number;
  expense: number;
  investment: number; // net (contributions - withdrawals)
  balance: number; // income - expense - investment (free cash, matches sheet)
  savingsRate: number; // (income - expense) / income
}

export function totals(txns: Transaction[]): Totals {
  const income = sumBy(txns, "income");
  const expense = sumBy(txns, "expense");
  const investment = sumBy(txns, "investment");
  const balance = income - expense - investment;
  const savingsRate = income > 0 ? (income - expense) / income : 0;
  return { income, expense, investment, balance, savingsRate };
}

export interface MonthlyRow {
  key: string;
  income: number;
  expense: number;
  investment: number;
  net: number;
}

export function monthlySeries(txns: Transaction[]): MonthlyRow[] {
  const map = new Map<string, MonthlyRow>();
  for (const t of txns) {
    const key = monthKey(t.txn_date);
    if (!map.has(key))
      map.set(key, { key, income: 0, expense: 0, investment: 0, net: 0 });
    const row = map.get(key)!;
    if (t.type === "income") row.income += t.amount;
    else if (t.type === "expense") row.expense += t.amount;
    else row.investment += t.amount;
  }
  const rows = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  let running = 0;
  for (const r of rows) {
    r.net = r.income - r.expense - r.investment;
    running += r.net;
  }
  return rows;
}

export function cumulativeBalance(rows: MonthlyRow[]) {
  let running = 0;
  return rows.map((r) => {
    running += r.net;
    return { key: r.key, balance: running };
  });
}

export interface CatSlice {
  category: string;
  value: number;
  count: number;
}

export function byCategory(txns: Transaction[], type: TxnType): CatSlice[] {
  const map = new Map<string, CatSlice>();
  for (const t of txns.filter((x) => x.type === type)) {
    if (!map.has(t.category))
      map.set(t.category, { category: t.category, value: 0, count: 0 });
    const s = map.get(t.category)!;
    s.value += t.amount;
    s.count += 1;
  }
  return [...map.values()].sort((a, b) => b.value - a.value);
}

// Net position per investment instrument (contributions minus withdrawals).
export function investmentPositions(txns: Transaction[]): CatSlice[] {
  return byCategory(txns, "investment")
    .filter((s) => s.category !== "Withdrawal")
    .map((s) => s);
}

export function availableMonths(txns: Transaction[]): string[] {
  const set = new Set(txns.map((t) => monthKey(t.txn_date)));
  return [...set].sort((a, b) => b.localeCompare(a));
}

export function topExpenses(txns: Transaction[], n = 5) {
  return txns
    .filter((t) => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, n);
}
