export type TxnType = "expense" | "income" | "investment";

export interface Transaction {
  id: number;
  user_id: string;
  type: TxnType;
  txn_date: string; // YYYY-MM-DD
  amount: number; // signed (investment withdrawals negative)
  description: string;
  category: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export type NewTransaction = {
  type: TxnType;
  txn_date: string;
  amount: number;
  description: string;
  category: string;
  source?: string | null;
};
