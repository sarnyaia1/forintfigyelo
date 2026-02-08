'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Budget, BudgetWithSpending, ExpenseCategory } from '@/lib/types/database'
import type { CreateBudgetInput, UpdateBudgetInput, BatchBudgetInput } from '@/lib/validations/budget'

/**
 * Get all budgets for a specific month with spending data
 */
export async function getBudgetsForMonth(monthId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  // Get budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('month_id', monthId)
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (budgetError) {
    return { error: budgetError.message }
  }

  // Get expenses grouped by category
  const { data: expenses, error: expenseError } = await supabase
    .from('expenses')
    .select('category, amount')
    .eq('month_id', monthId)
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (expenseError) {
    return { error: expenseError.message }
  }

  // Calculate spending by category
  const spendingByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category as ExpenseCategory
    acc[category] = (acc[category] || 0) + Number(expense.amount)
    return acc
  }, {} as Record<ExpenseCategory, number>)

  // Combine budgets with spending data
  const budgetsWithSpending: BudgetWithSpending[] = (budgets as Budget[]).map((budget) => {
    const spent = spendingByCategory[budget.category] || 0
    const remaining = Number(budget.budget_amount) - spent
    const percentage = Number(budget.budget_amount) > 0
      ? (spent / Number(budget.budget_amount)) * 100
      : 0

    return {
      ...budget,
      spent,
      remaining,
      percentage,
      isOverBudget: spent > Number(budget.budget_amount),
    }
  })

  return { data: budgetsWithSpending }
}

/**
 * Create a new budget
 */
export async function createBudget(input: CreateBudgetInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      month_id: input.month_id,
      category: input.category,
      budget_amount: input.budget_amount,
    })
    .select()
    .single()

  if (error) {
    // Check if it's a unique constraint violation
    if (error.code === '23505') {
      return { error: 'Ehhez a kategóriához már van beállított költségvetés ebben a hónapban' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: data as Budget }
}

/**
 * Update an existing budget
 */
export async function updateBudget(input: UpdateBudgetInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('budgets')
    .update({ budget_amount: input.budget_amount })
    .eq('id', input.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: data as Budget }
}

/**
 * Delete a budget (soft delete)
 */
export async function deleteBudget(budgetId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { error } = await supabase
    .from('budgets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', budgetId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Batch upsert budgets (for setting all categories at once)
 */
export async function setBudgetsForMonth(input: BatchBudgetInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  // Delete existing budgets for this month
  await supabase
    .from('budgets')
    .delete()
    .eq('month_id', input.month_id)
    .eq('user_id', user.id)

  // Insert new budgets
  const budgetsToInsert = input.budgets.map((budget) => ({
    user_id: user.id,
    month_id: input.month_id,
    category: budget.category,
    budget_amount: budget.budget_amount,
  }))

  const { data, error } = await supabase
    .from('budgets')
    .insert(budgetsToInsert)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: data as Budget[] }
}

/**
 * Get total budget and spending for a month
 */
export async function getMonthBudgetSummary(monthId: string) {
  const result = await getBudgetsForMonth(monthId)

  if (result.error || !result.data) {
    return result
  }

  const totalBudget = result.data.reduce((sum, b) => sum + Number(b.budget_amount), 0)
  const totalSpent = result.data.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return {
    data: {
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercentage,
      isOverBudget: totalSpent > totalBudget,
      budgets: result.data,
    },
  }
}
