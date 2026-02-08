'use client'

import { Settings, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BudgetForm } from '@/components/forms/budget-form'
import type { BudgetWithSpending } from '@/lib/types/database'

interface BudgetOverviewProps {
  budgets: BudgetWithSpending[]
  monthId: string
}

export function BudgetOverview({ budgets, monthId }: BudgetOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProgressBarColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500'
    if (percentage >= 90) return 'bg-yellow-500'
    if (percentage >= 75) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.budget_amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Költségvetés</CardTitle>
              <CardDescription>
                Még nincs beállítva költségvetés ehhez a hónaphoz
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Beállítás
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Havi költségvetés beállítása</DialogTitle>
                  <DialogDescription>
                    Állítsd be a havi limitet minden kiadási kategóriához.
                  </DialogDescription>
                </DialogHeader>
                <BudgetForm monthId={monthId} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Költségvetés áttekintés</CardTitle>
              <CardDescription>
                Havi költségvetés vs. tényleges kiadások
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Módosítás
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Költségvetés módosítása</DialogTitle>
                  <DialogDescription>
                    Frissítsd a havi limitet minden kategóriához.
                  </DialogDescription>
                </DialogHeader>
                <BudgetForm monthId={monthId} existingBudgets={budgets} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Összesen</span>
                <span className="font-medium">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressBarColor(overallPercentage, totalSpent > totalBudget)}`}
                  style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {overallPercentage.toFixed(1)}% felhasználva
                </span>
                <span className={`font-medium ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalRemaining >= 0 ? (
                    <span className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {formatCurrency(totalRemaining)} maradt
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {formatCurrency(Math.abs(totalRemaining))} túllépés
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => (
          <Card key={budget.id} className={budget.isOverBudget ? 'border-red-300 dark:border-red-700' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{budget.category}</CardTitle>
                {budget.isOverBudget && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Költött</span>
                <span className={`font-medium ${budget.isOverBudget ? 'text-red-600' : ''}`}>
                  {formatCurrency(budget.spent)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Limit</span>
                <span className="font-medium">{formatCurrency(Number(budget.budget_amount))}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressBarColor(budget.percentage, budget.isOverBudget)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {budget.percentage.toFixed(1)}%
                </span>
                <span className={`font-medium ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {budget.remaining >= 0 ? (
                    <span>{formatCurrency(budget.remaining)} maradt</span>
                  ) : (
                    <span>{formatCurrency(Math.abs(budget.remaining))} túllépés</span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
