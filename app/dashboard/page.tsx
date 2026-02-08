import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { hu } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { logoutAction } from '@/app/actions/auth'
import { getOrCreateMonth, getMonths } from '@/app/actions/months'
import { getIncomeByMonth } from '@/app/actions/income'
import { getExpensesByMonth } from '@/app/actions/expenses'
import { getBudgetsForMonth } from '@/app/actions/budget'
import { MonthSelector } from '@/components/dashboard/month-selector'
import { IncomeForm } from '@/components/forms/income-form'
import { ExpenseForm } from '@/components/forms/expense-form'
import { IncomeList } from '@/components/dashboard/income-list'
import { ExpenseList } from '@/components/dashboard/expense-list'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { BudgetOverview } from '@/components/dashboard/budget-overview'

interface DashboardPageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current month or use query parameter
  const params = await searchParams
  const currentMonthStr = params.month || format(new Date(), 'yyyy-MM')
  const [year, month] = currentMonthStr.split('-').map(Number)

  // Get or create the month
  const monthResult = await getOrCreateMonth(year, month)
  if (monthResult.error || !monthResult.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Hiba történt a hónap betöltése során</div>
      </div>
    )
  }

  const currentMonth = monthResult.data

  // Get all months for selector
  const monthsResult = await getMonths()
  const allMonths = monthsResult.data || []

  // Get income and expenses for current month
  const incomeResult = await getIncomeByMonth(currentMonth.id)
  const expenseResult = await getExpensesByMonth(currentMonth.id)
  const budgetResult = await getBudgetsForMonth(currentMonth.id)

  const incomes = incomeResult.data || []
  const expenses = expenseResult.data || []
  const budgets = budgetResult.data || []

  // Calculate totals
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">H</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  HaviKiadas
                </span>
              </div>

              {/* Month Selector */}
              <MonthSelector months={allMonths} currentMonth={currentMonthStr} />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{user.email}</span>
              </div>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Kijelentkezés
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {format(new Date(year, month - 1), 'yyyy MMMM', { locale: hu })}
            </p>
          </div>

          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Új bevétel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Új bevétel hozzáadása</DialogTitle>
                  <DialogDescription>
                    Add meg az új bevétel adatait az alábbi űrlapon.
                  </DialogDescription>
                </DialogHeader>
                <IncomeForm monthId={currentMonth.id} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Új kiadás
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Új kiadás hozzáadása</DialogTitle>
                  <DialogDescription>
                    Add meg az új kiadás adatait az alábbi űrlapon.
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm monthId={currentMonth.id} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          startingBalance={Number(currentMonth.starting_balance)}
        />

        {/* Budget Section */}
        <div className="mt-8">
          <BudgetOverview budgets={budgets} monthId={currentMonth.id} />
        </div>

        {/* Income Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Bevételek</CardTitle>
              <CardDescription>
                {incomes.length} bevétel ebben a hónapban
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeList incomes={incomes} monthId={currentMonth.id} />
            </CardContent>
          </Card>
        </div>

        {/* Expense Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Kiadások</CardTitle>
              <CardDescription>
                {expenses.length} kiadás ebben a hónapban
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseList expenses={expenses} monthId={currentMonth.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
