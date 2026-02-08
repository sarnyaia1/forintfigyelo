// Database types matching the Supabase schema
export type ExpenseCategory =
  | 'Bevásárlás'
  | 'Szórakozás'
  | 'Vendéglátás'
  | 'Extra'
  | 'Utazás'
  | 'Kötelező kiadás'
  | 'Ruha'
  | 'Sport'

export type IncomeSourceType = 'Fizetés' | 'Utalás' | 'Vállalkozás' | 'Egyéb'

export interface Month {
  id: string
  user_id: string
  year: number
  month: number
  starting_balance: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Income {
  id: string
  user_id: string
  month_id: string
  date: string // ISO date string
  amount: number
  source_type: IncomeSourceType
  custom_source: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Expense {
  id: string
  user_id: string
  month_id: string
  date: string // ISO date string
  amount: number
  item_name: string
  category: ExpenseCategory
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Helper type for month display
export interface MonthDisplay {
  value: string // Format: "YYYY-MM"
  label: string // Format: "2024 Február"
}

// Summary types for dashboard
export interface MonthSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  startingBalance: number
}

export interface ExpensesByCategory {
  category: ExpenseCategory
  total: number
  count: number
}

// Budget types
export interface Budget {
  id: string
  user_id: string
  month_id: string
  category: ExpenseCategory
  budget_amount: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Budget with actual spending
export interface BudgetWithSpending extends Budget {
  spent: number
  remaining: number
  percentage: number // 0-100+
  isOverBudget: boolean
}
