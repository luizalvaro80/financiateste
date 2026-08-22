export interface MonthlyBalance {
  id: string;
  user_id: string;
  month: number;
  year: number;
  opening_balance: number;
  total_income: number;
  total_expenses: number;
  closing_balance: number;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}