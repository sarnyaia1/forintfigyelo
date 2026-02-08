import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/actions/auth'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">H</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                HaviKiadas
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                👋 Üdv, <span className="font-semibold">{user.email}</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Üdvözöllek a HaviKiadas alkalmazásban! 🎉
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder cards */}
          <Card>
            <CardHeader>
              <CardTitle>✅ Auth Működik!</CardTitle>
              <CardDescription>Sikeresen bejelentkeztél</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Az auth rendszer teljesen működőképes. Email: {user.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⏳ Következő: Bevételek</CardTitle>
              <CardDescription>Hamarosan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bevételek CRUD műveletek készülnek...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⏳ Következő: Kiadások</CardTitle>
              <CardDescription>Hamarosan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kiadások CRUD műveletek készülnek...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⏳ Következő: Grafikonok</CardTitle>
              <CardDescription>Hamarosan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Költési megoszlás és trendek vizualizációja készül...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⏳ Következő: AI Tippek</CardTitle>
              <CardDescription>Hamarosan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Claude API integráció PRO TIPP generáláshoz készül...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Progress</CardTitle>
              <CardDescription>Fejlesztési státusz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Next.js Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Supabase Connection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Auth System</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⏳</span>
                  <span>Dashboard UI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">⏳</span>
                  <span>CRUD Operations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
