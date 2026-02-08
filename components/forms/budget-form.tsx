'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BUDGET_CATEGORIES } from '@/lib/validations/budget'
import { setBudgetsForMonth } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { Budget } from '@/lib/types/database'

interface BudgetFormProps {
  monthId: string
  existingBudgets?: Budget[]
  onSuccess?: () => void
}

export function BudgetForm({ monthId, existingBudgets = [], onSuccess }: BudgetFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form state with existing budgets or zeros
  const initialBudgets = BUDGET_CATEGORIES.reduce((acc, category) => {
    const existing = existingBudgets.find((b) => b.category === category)
    acc[category] = existing ? Number(existing.budget_amount) : 0
    return acc
  }, {} as Record<string, number>)

  const [budgets, setBudgets] = useState(initialBudgets)

  const handleChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setBudgets((prev) => ({ ...prev, [category]: numValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Filter out categories with zero budget
      const budgetsToSave = Object.entries(budgets)
        .filter(([_, amount]) => amount > 0)
        .map(([category, amount]) => ({
          category: category as (typeof BUDGET_CATEGORIES)[number],
          budget_amount: amount,
        }))

      if (budgetsToSave.length === 0) {
        toast.error('Adj meg legalább egy kategória költségvetését')
        setIsLoading(false)
        return
      }

      const result = await setBudgetsForMonth({
        month_id: monthId,
        budgets: budgetsToSave,
      })

      if (result.error) {
        toast.error('Hiba történt', {
          description: result.error,
        })
      } else {
        toast.success('Költségvetés beállítva', {
          description: 'A havi költségvetés sikeresen mentve.',
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.refresh()
        }
      }
    } catch (error) {
      toast.error('Hiba történt', {
        description: 'Váratlan hiba történt. Próbáld újra.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalBudget = Object.values(budgets).reduce((sum, amount) => sum + amount, 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {BUDGET_CATEGORIES.map((category) => (
          <div key={category} className="space-y-2">
            <Label htmlFor={category} className="text-sm font-medium">
              {category}
            </Label>
            <div className="relative">
              <Input
                id={category}
                type="number"
                step="1"
                min="0"
                value={budgets[category] || ''}
                onChange={(e) => handleChange(category, e.target.value)}
                placeholder="0"
                className="pr-12"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">Ft</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Összes költségvetés:
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('hu-HU', {
              style: 'currency',
              currency: 'HUF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalBudget)}
          </span>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || totalBudget === 0}>
          {isLoading ? 'Mentés...' : 'Költségvetés mentése'}
        </Button>
      </div>
    </form>
  )
}
