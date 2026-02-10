import Link from 'next/link'
import { ArrowRight, PiggyBank, TrendingUp, Shield, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Header / Nav */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HaviKiadas</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Bejelentkezés</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Regisztráció
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Tartsd kézben a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">havi pénzügyeidet</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Kövesd nyomon bevételeidet és kiadásaidat, állíts be havi költségkeretet, és hozz jobb pénzügyi döntéseket - egyszerűen, magyarul.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base px-8">
                  Ingyenes regisztráció
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Már van fiókom
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Miért válaszd a HaviKiadást?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Minden, amire szükséged van a havi költségvetésed kezeléséhez
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bevételek és kiadások</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Rögzítsd a havi bevételeidet és kiadásaidat kategóriánként, és lásd az egyenleged valós időben.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Költségkeret tervezés</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Állíts be havi költségkeretet kategóriánként, és kapj figyelmeztetést, ha túlléped a limitet.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Átlátható kimutatások</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Havi összesítők és bontás kategóriánként, hogy mindig tudd, hova megy a pénzed.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Biztonságos és privát</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Az adataid biztonságban vannak. Minden adat titkosítva és jelszóval védve, csak te férhetsz hozzá.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Kezdd el a tudatos pénzügyi tervezést
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Regisztrálj ingyen, és vedd kézbe a pénzügyeidet még ma.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base px-8">
                Kezdjük el
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">H</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">HaviKiadas</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Havi költségkezelő alkalmazás - egyszerűen, magyarul.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
