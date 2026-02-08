import { z } from 'zod'

const budgetCategories = [
  'Bevásárlás',
  'Szórakozás',
  'Vendéglátás',
  'Extra',
  'Utazás',
  'Kötelező kiadás',
  'Ruha',
  'Sport',
] as const

export const budgetSchema = z.object({
  category: z.enum(budgetCategories, {
    errorMap: () => ({ message: 'Érvénytelen kategória' }),
  }),
  budget_amount: z
    .number({ invalid_type_error: 'Az összegnek számnak kell lennie' })
    .nonnegative('Az összeg nem lehet negatív')
    .max(99999999.99, 'Az összeg túl nagy'),
})

export const createBudgetSchema = budgetSchema.extend({
  month_id: z.string().uuid('Érvénytelen hónap azonosító'),
})

export const updateBudgetSchema = z.object({
  id: z.string().uuid('Érvénytelen költségvetés azonosító'),
  budget_amount: z
    .number({ invalid_type_error: 'Az összegnek számnak kell lennie' })
    .nonnegative('Az összeg nem lehet negatív')
    .max(99999999.99, 'Az összeg túl nagy'),
})

// Batch update schema for setting all budgets at once
export const batchBudgetSchema = z.object({
  month_id: z.string().uuid('Érvénytelen hónap azonosító'),
  budgets: z.array(budgetSchema).min(1, 'Legalább egy kategória költségvetését meg kell adni'),
})

export type BudgetInput = z.infer<typeof budgetSchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type BatchBudgetInput = z.infer<typeof batchBudgetSchema>

// Export categories for use in components
export const BUDGET_CATEGORIES = budgetCategories
