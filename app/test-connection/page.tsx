import { createClient } from '@/lib/supabase/server'

export default async function TestConnectionPage() {
  const supabase = await createClient()

  // Teszt: Lekérjük a profiles tábla sémáját (nem adatokat, csak hogy létezik-e)
  const { data, error } = await supabase.from('profiles').select('*').limit(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            🧪 Supabase Kapcsolat Teszt
          </h1>

          <div className="space-y-4">
            {/* Environment változók */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-300">
                📋 Environment Változók
              </h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                    <span className="text-green-600">✅</span>
                  ) : (
                    <span className="text-red-600">❌</span>
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'HIÁNYZIK'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                    <span className="text-green-600">✅</span>
                  ) : (
                    <span className="text-red-600">❌</span>
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-10) : 'HIÁNYZIK'}
                  </span>
                </div>
              </div>
            </div>

            {/* Adatbázis kapcsolat */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-300">
                🗄️ Adatbázis Kapcsolat
              </h2>
              {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  <p className="text-red-800 dark:text-red-300 font-semibold">❌ Hiba történt:</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error.message}</p>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                  <p className="text-green-800 dark:text-green-300 font-semibold">
                    ✅ Sikeres kapcsolódás!
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                    A <code className="bg-green-100 dark:bg-green-800 px-1 rounded">profiles</code> tábla elérhető.
                  </p>
                </div>
              )}
            </div>

            {/* Következő lépések */}
            <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <h2 className="font-semibold text-lg mb-3 text-blue-800 dark:text-blue-300">
                📌 Következő lépések
              </h2>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <li>✅ Supabase kapcsolat működik</li>
                <li>⏳ Auth rendszer implementálása (login, register)</li>
                <li>⏳ Dashboard UI létrehozása</li>
                <li>⏳ Bevételek/kiadások CRUD műveletek</li>
              </ul>
            </div>

            {/* Vissza gomb */}
            <div className="pt-4">
              <a
                href="/"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                ← Vissza a főoldalra
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
